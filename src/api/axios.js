// src/api/instance.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let failedQueue = []
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  failedQueue = []
}

// axios 인스턴스에 임시 추가
api.interceptors.request.use(cfg => {
  console.log('[API OUT]', cfg.method?.toUpperCase(), cfg.url, cfg.data)
  return cfg
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('=== Axios 요청 인터셉터 ===')
    console.log('요청 URL:', config.url)
    console.log('요청 메서드:', config.method)
    console.log('요청 헤더:', config.headers)

    // reissue/login 에만 Authorization 생략 (logout엔 붙임)
    const skipAuth =
      config.url?.includes('/auth/reissue') ||
      config.url?.includes('/auth/login') ||
      config.url?.includes('/codef/captcha') ||
      config.url?.includes('/codef/secure')

    if (!skipAuth) {
      const at = localStorage.getItem('token')
      console.log('localStorage에서 가져온 토큰:', at)
      if (at) {
        config.headers.Authorization = `Bearer ${at}`
        console.log('Authorization 헤더 설정됨:', config.headers.Authorization)
      } else {
        console.log('토큰이 없어서 Authorization 헤더 설정 안됨')
      }
    }

    console.log('최종 요청 헤더:', config.headers)
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config || {}
    const status = error.response?.status
    const isReissue = originalRequest?.url?.includes('/auth/reissue')
    const isLogout = originalRequest?.url?.includes('/auth/logout')

    // 로그아웃 401: 재발급 시도하지 말고 바로 정리
    if (isLogout && status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('isLoggedIn')
      window.location.href = '/auth/login?relogin=1'
      return Promise.reject(error)
    }

    // 401: reissue가 아니고, 아직 재시도 안 했을 때만 재발급
    if (status === 401 && !originalRequest._retry && !isReissue) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newAT) => {
            if (newAT) originalRequest.headers.Authorization = `Bearer ${newAT}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 쿠키 기반 reissue (body 비움)
        const res = await api.post('/auth/reissue', {})
        const { accessToken } = res.data || {}
        if (!accessToken) throw new Error('No accessToken in reissue response')

        localStorage.setItem('token', accessToken)
        processQueue(null, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('isLoggedIn')
        window.location.href = '/auth/login?relogin=1'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // reissue 자체 실패(400/409) → 상태 정리 후 로그인 이동
    if (isReissue && (status === 400 || status === 409)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('isLoggedIn')
      window.location.href = '/auth/login?relogin=1'
    }

    return Promise.reject(error)
  }
)

export default api
