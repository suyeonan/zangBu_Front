// src/stores/auth.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, refreshToken as refreshTokenApi } from '@/api/auth/auth.js'

/**
 * 서버가 refreshToken을 HttpOnly 쿠키로 운용하면 true
 *  - true : 프론트는 refreshToken을 로컬에 저장하지 않음
 *  - false: 프론트 로컬에 refreshToken 저장
 */
const USE_REFRESH_COOKIE = true

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const accessToken = ref(localStorage.getItem('token') || null)
  // 쿠키 운용일 땐 null 유지가 정상
  const refreshToken = ref(null) // 쿠키 운용이면 항상 null로 둠

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  async function login(credentials) {
    try {
      const { data } = await loginApi({
        email: credentials.email,
        password: credentials.password,
      })

      // 백엔드는 accessToken만 바디로 내려옴 (refresh는 쿠키)
      const { accessToken: at, role, nickname } = data || {}
      if (!at) {
        throw new Error('액세스 토큰이 응답에 없습니다.')
      }

      // accessToken만 저장, refresh는 저장 안 함
      setTokens({ accessToken: at }, { persistRefresh: false })

      // [FCM] 로그인 성공 직후: FCM 토큰 등록 (실패해도 로그인 흐름 유지)
      try {
        await FcmOnLogin()
      } catch {
              /* noop */
      }

      // 혹시 예전 구조로 남아있을 로컬 refreshToken 제거
      localStorage.removeItem('refreshToken')

      setUser({ nickname, role, email: credentials.email })
      return { ok: true, role, nickname }
    } catch (err) {
      const status = err?.response?.status
      const e = new Error(
        status === 401
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : status === 400
          ? '입력 정보를 확인해주세요.'
          : status === 500
          ? '서버 내부 오류가 발생했습니다. 다시 시도해주세요.'
          : err?.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
      )
      e.status = status
      throw e
    }
  }

  function setTokens(tokens, { persistRefresh = false } = {}) {
    accessToken.value = tokens.accessToken || null
    if (tokens.accessToken) localStorage.setItem('token', tokens.accessToken)
    else localStorage.removeItem('token')

    // 쿠키 기반이므로 항상 저장 안 함
    refreshToken.value = null
    localStorage.removeItem('refreshToken')
  }

  function setUser(userData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isLoggedIn', 'true')
  }

  async function logout() {
        // [FCM] 로그아웃 직전: 서버에 현재 기기 토큰 삭제 요청 (Authorization 필요할 수 있으므로 먼저 완료)
    try {
      await FcmOnLogout()
    } catch {
      /* noop */
    }

    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
  }

  // 토큰 갱신 (쿠키 운용 시 보통 accessToken만 교체)
  async function refreshAccessToken() {
    try {
      const { data } = await refreshTokenApi()
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data || {}

      // 쿠키 운용이면 refresh 저장 X
      setTokens(
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken, // 있을 수도 있으나 아래 옵션으로 저장할지 결정
        },
        { persistRefresh: !USE_REFRESH_COOKIE ? true : false }
      )

      return newAccessToken
    } catch (error) {
      console.error('토큰 갱신 실패:', error)
      logout()
      throw error
    }
  }

  // 토큰 유효성 검사 (임시: 존재만 체크)
  function isTokenValid() {
    if (!accessToken.value) return false
    console.log('🔍 토큰 유효성 검사 - 일시적으로 토큰 존재 여부만 확인')
    return true

    // 만료 파싱 체크를 복구하려면 아래 로직 사용
    /*
    try {
      const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime + 300
    } catch (error) {
      console.error('토큰 파싱 오류:', error)
      return false
    }
    */
  }

  function signup(userData) {}
  function findId(email) {}
  function findPassword(email) {}

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    logout,
    signup,
    findId,
    findPassword,
    setTokens,
    setUser,
    refreshAccessToken,
    isTokenValid,
  }
})
