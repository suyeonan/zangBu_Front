import { ref, computed, readonly } from 'vue'
import { useRouter } from 'vue-router'
import { checkMembershipStatus } from '@/api/payment/payment'

export function useMembership() {
  const router = useRouter()

  // 멤버십 상태
  const membershipStatus = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // 멤버십 보유 여부
  const hasMembership = computed(() => {
    return membershipStatus.value?.hasMembership === true
  })

  // 멤버십 만료 여부
  const isExpired = computed(() => {
    return membershipStatus.value?.isExpired === true
  })

  // 유효한 멤버십 여부
  const isValidMembership = computed(() => {
    return hasMembership.value && !isExpired.value
  })

  // 멤버십 상태 조회
  const fetchMembershipStatus = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await checkMembershipStatus()
      membershipStatus.value = response

      return response
    } catch (err) {
      error.value = err.message || '멤버십 상태 조회에 실패했습니다.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 멤버십 검증 및 리다이렉트
  const validateMembership = async (options = {}) => {
    const {
      redirectToLogin = true,
      redirectToPayment = true,
      onSuccess = null,
      onFailure = null
    } = options

    try {
      // 로그인 상태 확인
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) {
        if (redirectToLogin) {
          router.push({
            path: '/auth/login',
            query: { redirect: window.location.pathname }
          })
        }
        onFailure?.('로그인이 필요합니다.')
        return { success: false, reason: 'not_logged_in' }
      }

      // 멤버십 상태 조회
      await fetchMembershipStatus()

      // 멤버십 유효성 검증
      if (isValidMembership.value) {
        onSuccess?.()
        return { success: true, membership: membershipStatus.value }
      } else {
        if (redirectToPayment) {
          router.push('/payment')
        }
        onFailure?.('멤버십이 필요합니다.')
        return { success: false, reason: 'no_membership' }
      }
    } catch (err) {
      console.error('멤버십 검증 실패:', err)
      if (redirectToPayment) {
        router.push('/payment')
      }
      onFailure?.('멤버십 검증에 실패했습니다.')
      return { success: false, reason: 'error' }
    }
  }

  // 멤버십 상태 새로고침
  const refreshMembershipStatus = () => {
    membershipStatus.value = null
    return fetchMembershipStatus()
  }

  return {
    // 상태
    membershipStatus: readonly(membershipStatus),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // computed
    hasMembership,
    isExpired,
    isValidMembership,

    // 메서드
    fetchMembershipStatus,
    validateMembership,
    refreshMembershipStatus
  }
}
