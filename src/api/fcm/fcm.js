// /src/api/fcm.js
import api from '@/api/axios'

// 로그인 직후: 토큰 등록
export function registerFcmTokenApi({ token, platform = 'web', deviceId } = {}) {
  return api.post('/fcm/register', { token, platform, deviceId })
}

// 로그아웃 직후: 단일 토큰 삭제 (DELETE + body)
export function removeFcmTokenApi({ token }) {
  return api.delete('/fcm/remove', { data: { token } })
}

// 회원탈퇴 직후: 모든 토큰 삭제
export function removeAllFcmTokensApi() {
  return api.delete('/fcm/remove/all')
}
