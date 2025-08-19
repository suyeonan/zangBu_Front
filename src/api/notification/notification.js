import api from '@/api/axios'

/**
 * 전체 알림 목록 조회 (페이징 지원)
 * GET /notification/all?page=1&size=10
 *
 * @param {{ page: number, size: number }} params - 페이지 번호와 항목 수
 * @returns {Promise<{ data: Notification[], pageInfo: PageInfo }>} 알림 목록과 페이지 정보 포함
 */
export async function getNotificationsApi({ page = 1, size = 10, type = 'ALL' } = {}) {
  const params = { page: Math.max(Number(page) || 1, 1), size: Number(size) || 10 }
  const up = String(type).toUpperCase()
  if (up !== 'ALL') params.type = up // BUILDING | TRADE | REVIEW

  const { data } = await api.get('/notification/all', { params })

  const rawItems = Array.isArray(data?.notifications) ? data.notifications : []
  const items = rawItems.map((n) => ({
    id: n.notificationId ?? n.id,
    title: n.title ?? '',
    message: n.message ?? '',
    type: n.type ?? 'UNKNOWN', // BUILDING | TRADE | REVIEW
    isRead: !!n.read, // 서버: read → 프론트: isRead
    createdAt: n.createdAt, // "1일 전" 등 가공 문자열
    address: n.address,
    priceLabel: n.priceLabel,
    rank: n.rank,
    // 라우팅용 참조 ID들
    buildingId: n.buildingId ?? n.propertyId ?? null,
    reviewId: n.reviewId ?? null,
    tradeId: n.tradeId ?? null,
  }))

  // ... items 매핑한 바로 다음 줄에 추가
  console.log(
    '[notification] buildingIds',
    items.map((x) => ({ id: x.id, type: x.type, buildingId: x.buildingId }))
  )

  return {
    items,
    pageNumber: Number(data?.pageNum) || params.page,
    pageSize: Number(data?.pageSize) || params.size,
    totalElements: Number(data?.totalElements ?? items.length),
    totalPages: Number(data?.totalPages ?? 1),
    filterCounts: {
      ALL: Number(data?.filterCounts?.ALL ?? 0),
      BUILDING: Number(data?.filterCounts?.BUILDING ?? 0),
      TRADE: Number(data?.filterCounts?.TRADE ?? 0),
      REVIEW: Number(data?.filterCounts?.REVIEW ?? 0),
    },
  }
}

/**
 * 단일 알림 읽음 처리
 * PATCH /notification/read/{id}
 *
 * @param {number} id - 읽음 처리할 알림 ID
 * @returns {Promise<number>} - 읽음 처리된 알림 ID가 반환
 */
export const markNotificationAsReadApi = async (id) => {
  const res = await api.patch(`/notification/read/${id}`)
  return res.data
}

/**
 * 전체 알림 읽음 처리
 * PATCH /notification/read/all
 *
 * @returns {Promise<{ count: number }>} 처리된 알림 수 반환
 */
export const markAllNotificationsAsReadApi = async () => {
  const res = await api.patch('/notification/read/all')
  return res.data
}

/**
 * 알림 삭제
 * DELETE /notification/remove/{id}
 *
 * @param {number} id - 삭제할 알림 ID
 * @returns {Promise<number>} - 삭제된 알림  ID가 반환
 */
export const deleteNotificationApi = async (id) => {
  const res = await api.delete(`/notification/remove/${id}`)
  return res.data
}
