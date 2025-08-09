import axios from '@/api/axios'

// 결제 승인 API
export const confirmPayment = async (paymentInfo) => {
  try {
    const response = await axios.post('/payment/confirm', paymentInfo)
    return response.data
  } catch (error) {
    console.error('결제 승인 API 호출 실패:', error)
    throw error
  }
}

// 결제 상태 확인
export const checkPaymentStatus = async (orderId) => {
  try {
    const response = await axios.get(`/payment/status/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 결제 내역 조회
export const getPaymentHistory = (params) => {
  return axios.get('/payments/history', { params })
}

// 결제 처리
export const processPayment = (paymentData) => {
  return axios.post('/payments/process', paymentData)
}

// 결제 취소
export const cancelPayment = (paymentId) => {
  return axios.post(`/payments/${paymentId}/cancel`)
}

// 구매자 정보 조회 (결제용)
export const getBuyerInfo = async () => {
  try {
    const response = await axios.get('/auth/me')
    return {
      name: response.data.name,        // 구매자 이름
      email: response.data.email,      // 이메일
      phone: response.data.phone       // 휴대폰 번호
    }
  } catch (error) {
    console.error('구매자 정보 조회 실패:', error)
    throw error
  }
}

// 멤버십 상태 확인
export const checkMembershipStatus = async () => {
  try {
    const response = await axios.get('/membership/status')
    return response.data
  } catch (error) {
    console.error('멤버십 상태 확인 실패:', error)
    throw error
  }
}
