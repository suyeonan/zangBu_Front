// /stores/notification/notification.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getNotificationsApi,
  // getNotificationCountsApi, // 서버가 제공하면 주석 해제해서 사용
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  deleteNotificationApi,
} from '@/api/notification/notification'

const FILTERS = ['ALL', 'BUILDING', 'TRADE', 'REVIEW']
const PAGE_CAP = 3 // 미읽음 집계 fallback: 최대 순회 페이지
const SIZE_CAP = 100 // fallback page size

export const useNotificationStore = defineStore('notification', () => {
  // ---------- state ----------
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  const currentPage = ref(1) // 1-based UI
  const pageSize = ref(10)
  const totalPages = ref(1)
  const totalElements = ref(0)

  const activeFilter = ref('ALL')

  // 내부: 실제 전체 개수(노출용 아님)
  const _absoluteCounts = ref({ ALL: 0, BUILDING: 0, TRADE: 0, REVIEW: 0 })
  // 외부 노출: 미읽음 개수(헤더/탭은 이 값을 읽도록 강제)
  const unreadCounts = ref({ ALL: 0, BUILDING: 0, TRADE: 0, REVIEW: 0 })
  const totalCounts = computed(() => ({ ...unreadCounts.value })) // alias
  const filterCountMap = computed(() => ({ ...unreadCounts.value })) // alias

  // 요청 경합 방지 토큰
  let loadToken = 0

  // 서버가 이해하는 미읽음 필터 자동탐지 캐시
  let _unreadQueryTemplate = null // 예: { isRead:false } | { read:false } | { status:'UNREAD' } | { readYn:'N' }
  let _unreadProbeDone = false

  // FCM → 서버 동기화 디바운스 타이머
  let _syncTimer = null

  // ---------- getters ----------
  const filters = [
    { label: '전체', key: 'ALL' },
    { label: '시세 변동', key: 'BUILDING' },
    { label: '실거래', key: 'TRADE' },
    { label: '리뷰', key: 'REVIEW' },
  ]
  const unreadCountInPage = computed(() => notifications.value.filter((n) => !n.isRead).length)
  const unreadTotal = computed(() => unreadCounts.value.ALL ?? 0)

  // ---------- helpers ----------
  function _defaultTitle(type) {
    switch (type) {
      case 'REVIEW':
        return '리뷰 등록 알림'
      case 'TRADE':
        return '실거래 알림'
      case 'BUILDING':
        return '시세 변동 알림'
      default:
        return '알림'
    }
  }

  // [ ... ] 감싼 접두/전체 타이틀 제거 + 공백 정리
  function _cleanTitle(raw, type) {
    let t = (raw ?? '').toString().trim()
    if (!t) return _defaultTitle(type)
    // 형태 1: "[리뷰 등록 알림]" → "리뷰 등록 알림"
    t = t.replace(/^\s*\[\s*([^\]]+?)\s*\]\s*$/, '$1')
    // 형태 2: "[리뷰 등록 알림] 제목" → "제목"
    t = t.replace(/^\s*\[[^\]]+?\]\s+/, '')
    t = t.trim()
    if (!t) t = _defaultTitle(type)
    return t
  }

  function _inferType(d = {}, notif = {}) {
    const raw = (d?.type ?? d?.notificationType ?? '').toString().toUpperCase()
    if (['BUILDING', 'TRADE', 'REVIEW'].includes(raw)) return raw

    // title/body 키워드 기반 보정
    const title = (d?.title ?? notif?.title ?? '').toString()
    const body = (d?.message ?? notif?.body ?? '').toString()
    const txt = (title + ' ' + body).toLowerCase()
    if (/(리뷰|review)/.test(txt)) return 'REVIEW'
    if (/(실거래|거래|trade|deal)/.test(txt)) return 'TRADE'
    if (/(시세|가격|price|매매|전세|월세)/.test(txt)) return 'BUILDING'

    // 필드 힌트
    if (d.reviewId || d.review_id) return 'REVIEW'
    if (d.tradeId || d.trade_id) return 'TRADE'
    if (d.buildingId || d.building_id || d.saleType || d.sale_type || d.price != null)
      return 'BUILDING'
    return 'UNKNOWN'
  }

  const PLACEHOLDER_MSGS = new Set([
    '',
    '새 알림이 도착했습니다.',
    'New notification',
    'You have a new notification',
  ])
  const _isPlaceholder = (text) => PLACEHOLDER_MSGS.has((text ?? '').trim())

  function _buildMessageByType(type, b = {}) {
    const address = b.address ? `관심 매물 ${b.address}` : '관심 매물'
    if (type === 'REVIEW') {
      const score = b.rank != null ? ` (평점 ${b.rank}점)` : ''
      return `${address}에 새로운 리뷰가 등록되었습니다.${score}`
    }
    if (type === 'TRADE') return `${address}에 실거래가 발생했습니다.`
    if (type === 'BUILDING') {
      const tag = b.saleType ? `${b.saleType} ` : ''
      if (b.price != null) return `${tag}가격이 ${b.price}로 변동되었습니다.`
      return `${tag}시세가 변동되었습니다.`
    }
    return '새 알림이 도착했습니다.'
  }

  function normalizeNotification(n) {
    if (!n || typeof n !== 'object') return null
    const id = n.notificationId ?? n.id
    const type = (n.type || 'UNKNOWN').toUpperCase()
    const buildingId = n.buildingId ?? n.building_id ?? n.building?.id ?? n.meta?.buildingId ?? null
    return {
      id,
      type,
      isRead: !!(n.isRead ?? n.read ?? n.is_read),
      createdAt: n.createdAt ?? n.created_at ?? null,
      saleType: n.saleType ?? n.sale_type ?? null,
      price: n.price ?? null,
      address: n.address ?? null,
      rank: n.rank ?? null,
      buildingId,
      url: n.url ?? null,
      title: _cleanTitle(n.title ?? null, type),
      message: n.message ?? n.body ?? null,
      reviewId: n.reviewId ?? n.review_id ?? null,
      tradeId: n.tradeId ?? n.trade_id ?? null,
    }
  }

  /** FCM payload → UI 객체 */
  function normalizeFcmToUi(payload) {
    const d = payload?.data ?? payload ?? {}
    const notif = payload?.notification ?? {}
    const type = _inferType(d, notif)

    const base = {
      id: d.notificationId ?? d.id ?? String(Date.now()),
      type,
      isRead: false,
      createdAt: d.createdAt ?? d.created_at ?? d.createdAtText ?? '방금 전',
      saleType: d.saleType ?? d.sale_type ?? null,
      price: d.price ?? null,
      address: d.address ?? d.buildingName ?? d.building_name ?? null,
      rank: d.rank ?? d.rating ?? null,
      buildingId: d.buildingId ?? d.building_id ?? null,
      url: d.url ?? null,
      reviewId: d.reviewId ?? d.review_id ?? null,
      tradeId: d.tradeId ?? d.trade_id ?? null,
    }

    const titleRaw = d.title ?? notif.title ?? ''
    const title = _cleanTitle(titleRaw, type)

    let message = d.message ?? notif.body ?? ''
    if (_isPlaceholder(message)) message = _buildMessageByType(type, base)

    return { ...base, title, message }
  }

  // 서버가 먹는 "미읽음" 파라미터 자동탐지(한 번만)
  async function _probeUnreadQuery(totalAll) {
    if (_unreadProbeDone) return _unreadQueryTemplate
    const candidates = [{ isRead: false }, { read: false }, { status: 'UNREAD' }, { readYn: 'N' }]
    for (const cand of candidates) {
      try {
        const r = await getNotificationsApi({ page: 1, size: 1, type: 'ALL', ...cand })
        const unreadAll = Number(r?.totalElements ?? 0)
        if (unreadAll !== totalAll) {
          _unreadQueryTemplate = cand
          break
        }
      } catch {
        /* ignore */
      }
    }
    _unreadProbeDone = true
    return _unreadQueryTemplate
  }

  // ---------- FAST counts ----------
  async function refreshCountsFromServer() {
    try {
      // 전용 카운트 API가 있으면 이 블록만으로 끝
      // const counts = await getNotificationCountsApi()
      // if (counts?.total)  _absoluteCounts.value = { ...counts.total }
      // if (counts?.unread) unreadCounts.value    = { ...counts.unread }
      // return
    } catch {}

    // 1) 필터별 전체 개수(size=1)
    const totals = await Promise.all(
      FILTERS.map((k) => getNotificationsApi({ page: 1, size: 1, type: k }).catch(() => null))
    )
    const abs = {}
    FILTERS.forEach((k, i) => (abs[k] = Number(totals[i]?.totalElements ?? 0)))
    _absoluteCounts.value = abs

    // 2) 미읽음 파라미터 자동탐지
    const unreadQueryTemplate = await _probeUnreadQuery(abs.ALL)
    const un = { ALL: 0, BUILDING: 0, TRADE: 0, REVIEW: 0 }

    if (unreadQueryTemplate) {
      const unreadRes = await Promise.all(
        FILTERS.map((k) =>
          getNotificationsApi({ page: 1, size: 1, type: k, ...unreadQueryTemplate }).catch(
            () => null
          )
        )
      )
      FILTERS.forEach((k, i) => (un[k] = Number(unreadRes[i]?.totalElements ?? 0)))
    } else {
      // 3) 전부 미지원 → 상한 있는 초경량 집계
      const tasks = FILTERS.map(async (k) => {
        if (abs[k] === 0) return 0
        let page = 1,
          unread = 0
        const maxPages = Math.min(PAGE_CAP, Math.ceil(abs[k] / SIZE_CAP))
        while (page <= maxPages) {
          const r = await getNotificationsApi({ page, size: SIZE_CAP, type: k }).catch(() => null)
          const items = (r?.items ?? []).map(normalizeNotification)
          unread += items.reduce((acc, it) => acc + (it && !it.isRead ? 1 : 0), 0)
          if (!r || items.length === 0) break
          page++
        }
        return unread
      })
      const unreadList = await Promise.all(tasks)
      FILTERS.forEach((k, i) => (un[k] = unreadList[i]))
    }
    unreadCounts.value = un
  }

  // ---------- actions ----------
  async function loadNotifications() {
    const myToken = ++loadToken
    loading.value = true
    error.value = null
    try {
      const res = await getNotificationsApi({
        page: currentPage.value,
        size: pageSize.value,
        type: activeFilter.value,
      })
      if (myToken !== loadToken) return
      notifications.value = (res.items ?? []).map(normalizeNotification).filter(Boolean)
      totalElements.value = Number(res.totalElements ?? 0)
      totalPages.value = Number(res.totalPages ?? 1)
      if (typeof res.pageNumber === 'number') currentPage.value = res.pageNumber
      if (typeof res.pageSize === 'number') pageSize.value = res.pageSize

      // 카운트는 비동기 초경량 갱신
      refreshCountsFromServer()
    } catch (e) {
      if (myToken !== loadToken) return
      console.error('[notification] load failed:', e)
      error.value = e?.response?.data?.message || e.message || '알림 불러오기 실패'
    } finally {
      if (myToken === loadToken) loading.value = false
    }
  }

  async function setNotificationPage(page) {
    if (page < 1 || (totalPages.value && page > totalPages.value)) return
    currentPage.value = page
    await loadNotifications()
  }

  async function setPageSize(size) {
    pageSize.value = size
    currentPage.value = 1
    await loadNotifications()
  }

  async function setNotificationFilter(key) {
    const up = String(key).toUpperCase()
    if (!FILTERS.includes(up)) return
    if (activeFilter.value === up) return
    activeFilter.value = up
    currentPage.value = 1
    await loadNotifications()
  }

  async function markNotificationAsRead(id) {
    const idx = notifications.value.findIndex((n) => n.id === id)
    if (idx >= 0 && !notifications.value[idx].isRead) {
      const t = (notifications.value[idx].type || 'UNKNOWN').toUpperCase()
      notifications.value[idx] = { ...notifications.value[idx], isRead: true }
      if (unreadCounts.value.ALL > 0) unreadCounts.value.ALL--
      if (['BUILDING', 'TRADE', 'REVIEW'].includes(t) && unreadCounts.value[t] > 0)
        unreadCounts.value[t]--
    }
    try {
      await markNotificationAsReadApi(id)
      refreshCountsFromServer()
    } catch (e) {
      if (idx >= 0) notifications.value[idx].isRead = false
      refreshCountsFromServer()
      throw e
    }
  }

  async function markNotificationAllAsRead() {
    const prev = notifications.value.map((n) => ({ ...n }))
    notifications.value = notifications.value.map((n) => ({ ...n, isRead: true }))
    unreadCounts.value = { ALL: 0, BUILDING: 0, TRADE: 0, REVIEW: 0 }
    try {
      await markAllNotificationsAsReadApi()
      refreshCountsFromServer()
    } catch (e) {
      notifications.value = prev
      refreshCountsFromServer()
      throw e
    }
  }

  async function deleteNotification(id) {
    const idx = notifications.value.findIndex((n) => n.id === id)
    let adjust = null
    if (idx >= 0) {
      adjust = {
        isUnread: !notifications.value[idx].isRead,
        type: (notifications.value[idx].type || '').toUpperCase(),
      }
      notifications.value.splice(idx, 1)
      _absoluteCounts.value.ALL = Math.max(0, (_absoluteCounts.value.ALL ?? 0) - 1)
      if (['BUILDING', 'TRADE', 'REVIEW'].includes(adjust.type)) {
        _absoluteCounts.value[adjust.type] = Math.max(
          0,
          (_absoluteCounts.value[adjust.type] ?? 0) - 1
        )
      }
      if (adjust.isUnread) {
        if (unreadCounts.value.ALL > 0) unreadCounts.value.ALL--
        if (
          ['BUILDING', 'TRADE', 'REVIEW'].includes(adjust.type) &&
          unreadCounts.value[adjust.type] > 0
        ) {
          unreadCounts.value[adjust.type]--
        }
      }
    }
    try {
      await deleteNotificationApi(id)
      if (notifications.value.length === 0 && currentPage.value > 1) {
        await setNotificationPage(currentPage.value - 1)
      } else {
        await loadNotifications()
      }
    } catch (e) {
      refreshCountsFromServer()
      throw e
    }
  }

  async function _syncTopWithServerOnce() {
    try {
      const res = await getNotificationsApi({
        page: 1,
        size: Math.max(10, pageSize.value),
        type: activeFilter.value,
      })
      const latest = (res.items ?? []).map(normalizeNotification).filter(Boolean)
      if (!latest.length) return
      for (const item of latest) {
        const i = notifications.value.findIndex((n) => n.id === item.id)
        if (i >= 0) notifications.value[i] = item
      }
    } catch {
      /* ignore */
    }
  }

  function addNotificationFromFCM(payload) {
    const item = normalizeFcmToUi(payload)
    if (!item) return

    const dupIdx = notifications.value.findIndex((n) => n.id === item.id)
    if (dupIdx >= 0) notifications.value.splice(dupIdx, 1)
    notifications.value.unshift(item)

    // 미읽음 카운트 보정
    unreadCounts.value.ALL = (unreadCounts.value.ALL ?? 0) + 1
    if (['BUILDING', 'TRADE', 'REVIEW'].includes(item.type)) {
      unreadCounts.value[item.type] = (unreadCounts.value[item.type] ?? 0) + 1
    }

    // 짧게 디바운스하여 서버 데이터로 최종 정합성 맞춤(아이콘/제목/문구)
    clearTimeout(_syncTimer)
    _syncTimer = setTimeout(_syncTopWithServerOnce, 300)
  }

  return {
    // state
    loading,
    error,
    notifications,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    activeFilter,

    // 외부 노출(항상 미읽음)
    totalCounts,
    filterCountMap,
    unreadCounts,

    // getters
    filters,
    unreadCountInPage,
    unreadTotal,

    // actions
    loadNotifications,
    setNotificationPage,
    setPageSize,
    setNotificationFilter,
    markNotificationAsRead,
    markNotificationAllAsRead,
    deleteNotification,
    addNotificationFromFCM,

    // counts
    refreshCountsFromServer,
  }
})
