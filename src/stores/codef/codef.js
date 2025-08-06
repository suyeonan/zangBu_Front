import { defineStore } from 'pinia'
import {
  verifySecureCode,
  getComplexNo,
  verifySecureCodeWithToken,
  getComplexNoWithToken,
} from '@/api/codef/codef.js'

export const useCodefStore = defineStore('codef', {
  state: () => ({
    // 보안문자 인증 관련 상태
    secureVerification: {
      loading: false,
      success: false,
      error: null,
      data: null,
    },

    // 건물 일련번호 조회 관련 상태
    complexInfo: {
      loading: false,
      success: false,
      error: null,
      data: null,
    },

    // 세션 정보
    sessionKey: null,
    accessToken: null,
  }),

  getters: {
    // 보안문자 인증 상태
    isSecureVerifying: (state) => state.secureVerification.loading,
    isSecureVerified: (state) => state.secureVerification.success,
    secureError: (state) => state.secureVerification.error,
    secureData: (state) => state.secureVerification.data,

    // 건물 일련번호 조회 상태
    isComplexLoading: (state) => state.complexInfo.loading,
    isComplexSuccess: (state) => state.complexInfo.success,
    complexError: (state) => state.complexInfo.error,
    complexData: (state) => state.complexInfo.data,

    // 복합 상태
    hasSessionKey: (state) => !!state.sessionKey,
    hasAccessToken: (state) => !!state.accessToken,
  },

  actions: {
    // 세션 키 설정
    setSessionKey(sessionKey) {
      this.sessionKey = sessionKey
    },

    // 액세스 토큰 설정
    setAccessToken(accessToken) {
      this.accessToken = accessToken
    },

    // 보안문자 인증 (토큰 없이)
    async verifySecureCode(secureNo) {
      if (!this.sessionKey) {
        throw new Error('세션 키가 필요합니다.')
      }

      this.secureVerification.loading = true
      this.secureVerification.success = false
      this.secureVerification.error = null
      this.secureVerification.data = null

      try {
        const data = {
          sessionKey: this.sessionKey,
          secureNo: secureNo,
        }

        const response = await verifySecureCode(data)

        if (response.status === 200) {
          this.secureVerification.success = true
          this.secureVerification.data = response.data
          return { success: true, data: response.data }
        } else if (response.status === 404) {
          this.secureVerification.error = '보안문자 인증에 실패했습니다.'
          return { success: false, error: '보안문자 인증에 실패했습니다.' }
        } else if (response.status === 500) {
          this.secureVerification.error =
            '서버에서 보안 문자 인증을 처리하는데 오류가 발생했습니다.'
          return {
            success: false,
            error: '서버에서 보안 문자 인증을 처리하는데 오류가 발생했습니다.',
          }
        }
      } catch (error) {
        this.secureVerification.error = error.message || '보안문자 인증 중 오류가 발생했습니다.'
        return { success: false, error: error.message || '보안문자 인증 중 오류가 발생했습니다.' }
      } finally {
        this.secureVerification.loading = false
      }
    },

    // 보안문자 인증 (토큰 포함)
    async verifySecureCodeWithToken(secureNo) {
      if (!this.sessionKey) {
        throw new Error('세션 키가 필요합니다.')
      }

      if (!this.accessToken) {
        throw new Error('액세스 토큰이 필요합니다.')
      }

      this.secureVerification.loading = true
      this.secureVerification.success = false
      this.secureVerification.error = null
      this.secureVerification.data = null

      try {
        const data = {
          sessionKey: this.sessionKey,
          secureNo: secureNo,
        }

        const response = await verifySecureCodeWithToken(data, this.accessToken)

        if (response.status === 200) {
          this.secureVerification.success = true
          this.secureVerification.data = response.data
          return { success: true, data: response.data }
        } else {
          this.secureVerification.error = '보안문자 인증에 실패했습니다.'
          return { success: false, error: '보안문자 인증에 실패했습니다.' }
        }
      } catch (error) {
        this.secureVerification.error = error.message || '보안문자 인증 중 오류가 발생했습니다.'
        return { success: false, error: error.message || '보안문자 인증 중 오류가 발생했습니다.' }
      } finally {
        this.secureVerification.loading = false
      }
    },

    // 건물 일련번호 조회 (토큰 없이)
    async getComplexNo(addrSido, addrSigun, addrDong, buildingName) {
      this.complexInfo.loading = true
      this.complexInfo.success = false
      this.complexInfo.error = null
      this.complexInfo.data = null

      try {
        const data = {
          addrSido: addrSido,
          addrSigun: addrSigun,
          addrDong: addrDong,
          buildingName: buildingName,
        }

        const response = await getComplexNo(data)

        if (response.status === 200) {
          this.complexInfo.success = true
          this.complexInfo.data = response.data
          return { success: true, data: response.data }
        } else if (response.status === 404) {
          this.complexInfo.error = '건물 일련번호를 찾는데 실패했습니다.'
          return { success: false, error: '건물 일련번호를 찾는데 실패했습니다.' }
        } else if (response.status === 500) {
          this.complexInfo.error = '서버에서 건물 일련번호를 처리하는데 오류가 발생했습니다.'
          return {
            success: false,
            error: '서버에서 건물 일련번호를 처리하는데 오류가 발생했습니다.',
          }
        }
      } catch (error) {
        this.complexInfo.error = error.message || '건물 일련번호 조회 중 오류가 발생했습니다.'
        return {
          success: false,
          error: error.message || '건물 일련번호 조회 중 오류가 발생했습니다.',
        }
      } finally {
        this.complexInfo.loading = false
      }
    },

    // 건물 일련번호 조회 (토큰 포함)
    async getComplexNoWithToken(addrSido, addrSigun, addrDong, buildingName) {
      if (!this.accessToken) {
        throw new Error('액세스 토큰이 필요합니다.')
      }

      this.complexInfo.loading = true
      this.complexInfo.success = false
      this.complexInfo.error = null
      this.complexInfo.data = null

      try {
        const data = {
          addrSido: addrSido,
          addrSigun: addrSigun,
          addrDong: addrDong,
          buildingName: buildingName,
        }

        const response = await getComplexNoWithToken(data, this.accessToken)

        if (response.status === 200) {
          this.complexInfo.success = true
          this.complexInfo.data = response.data
          return { success: true, data: response.data }
        } else {
          this.complexInfo.error = '건물 일련번호를 찾는데 실패했습니다.'
          return { success: false, error: '건물 일련번호를 찾는데 실패했습니다.' }
        }
      } catch (error) {
        this.complexInfo.error = error.message || '건물 일련번호 조회 중 오류가 발생했습니다.'
        return {
          success: false,
          error: error.message || '건물 일련번호 조회 중 오류가 발생했습니다.',
        }
      } finally {
        this.complexInfo.loading = false
      }
    },

    // 상태 초기화
    resetSecureVerification() {
      this.secureVerification = {
        loading: false,
        success: false,
        error: null,
        data: null,
      }
    },

    resetComplexInfo() {
      this.complexInfo = {
        loading: false,
        success: false,
        error: null,
        data: null,
      }
    },

    // 전체 상태 초기화
    reset() {
      this.resetSecureVerification()
      this.resetComplexInfo()
      this.sessionKey = null
      this.accessToken = null
    },
  },
})
