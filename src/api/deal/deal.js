import { useAuthStore } from '@/stores/auth/auth'
import api from '../axios'

// 백엔드 서버 연결 상태 확인
export const checkServerHealth = () => {
  return api.get('/health')
}

// 거래 전체 목록 조회
export const getDeals = () => {
  // Postman에서 작동하는 방식과 동일하게 설정
  const request = api.get('/deal/waitinglist', {
    headers: {
      'Content-Type': 'application/json',
      // Postman에서 사용한 헤더와 동일하게 설정
    },
  })

  console.log('API 요청 객체:', request)
  return request
}

// 거래 상태 변경 (새로운 엔드포인트)
export const changeDealStatus = (dealData) => {
  const authStore = useAuthStore()
  const token = authStore?.accessToken

  return api.patch(
    '/deal/status',
    {
      chatRoomId: dealData.chatRoomId,
      dealId: dealData.dealId,
      status: dealData.status,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )
}

// 거래 가이드 조회
export const getDealGuide = () => {
  return api.get('/deals/guide')
}

// 거래전 안내 정보 조회
export const getDealNotice = (dealId) => {
  return api.get(`/deal/notice/${dealId}`)
}

// 소비자 문서 다운로드 URL 조회
export const getConsumerDocumentUrl = (dealId, type) => {
  return api.get(`/deal/consumer/documents/${dealId}/${type}/download`)
}

// 소비자 문서 새로고침
export const refreshConsumerDocument = (buildingId, type) => {
  return api.post(`/consumer/documents/${buildingId}/${type}/refresh`, {})
}

// 표준 계약서 다운로드
export const downloadStandardContract = (dealId) => {
  return api.get(`/deal/consumer/contract/${dealId}/download`)
}
