// /src/utils/fcm.js
// 스토어 없이 동작하는 FCM 유틸리티
// - 로그인/로그아웃/회원탈퇴 “한 줄” 파사드
// - 브라우저 Notification 권한 안전 처리
// - 민감 정보 콘솔 출력 없음

import { getToken, deleteToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/firebase'
import { registerFcmTokenApi, removeFcmTokenApi, removeAllFcmTokensApi } from '@/api/fcm/fcm'

// VAPID 공개키 (.env 권장)
const VAPID_KEY =
  import.meta.env?.VITE_FIREBASE_VAPID_KEY ||
  'BKhcEvdNGiKUI3wit7BYtwsVnqvdzVY3SsBnnzp4k5xvRgC6iHnjLpMDsV00NU1VRYvHCikwhP6WwPl7TA16lHA'

// 내부: 알림 권한 확보
async function ensurePermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

/** ================================
 *  유저팀 “한 줄” API
 *  ================================ */

// 로그인 직후: 권한 → 토큰 → 서버 등록
export async function FcmOnLogin({ platform = 'web', deviceId } = {}) {
  try {
    const ok = await ensurePermission()
    if (!ok) return null

    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (!token) return null

    await registerFcmTokenApi({ token, platform, deviceId })
    return token
  } catch {
    return null // 로그인 UX 방해 금지
  }
}

// 로그아웃 직후: 서버 단일 삭제 → 로컬 삭제(선택)
export async function FcmOnLogout() {
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (token) {
      await removeFcmTokenApi({ token })
    }
    try {
      await deleteToken(messaging)
    } catch {}
  } catch {
    /* noop */
  }
}

// 회원탈퇴 직후: 서버 전체 삭제 → 로컬 삭제
export async function FcmOnWithdraw() {
  try {
    await removeAllFcmTokensApi()
    try {
      await deleteToken(messaging)
    } catch {}
  } catch {
    /* noop */
  }
}

// 앱 시작 시(선택): 포그라운드 수신 리스너
export function FcmListenForeground(cb) {
  onMessage(messaging, async (payload) => {
    try {
      const ok = await ensurePermission()
      if (!ok) return

      const title = payload?.data?.title || payload?.notification?.title
      const body = payload?.data?.body || payload?.notification?.body
      const url = payload?.data?.url || payload?.fcmOptions?.link
      if (!title || !body) return

      const n = new Notification(title, { body, data: { url } })
      n.onclick = () => {
        const target = n?.data?.url
        if (target) window.open(target, '_blank')
      }

      if (typeof cb === 'function') cb(payload)
    } catch {
      /* noop */
    }
  })
}

// 기존: 로그인에서 요청/토큰 발급만 하던 함수명 → 서버 등록까지 포함해서 매핑
export async function requestFcmToken() {
  return FcmOnLogin()
}

// 기존: 로그아웃에서 서버/브라우저 삭제
export async function removeFcmToken() {
  return FcmOnLogout()
}

// 기존: 포그라운드 리스너 (store 의존 제거)
export function listenForegroundMessage(cb) {
  return FcmListenForeground(cb)
}
