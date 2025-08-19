import api from '../axios'

// 매물 상세보기
export const getPropertyDetail = (params) => {
  return api.post('/building', params)
}

// 매물 상세보기 (buildingId로 조회)
export const getPropertyDetailById = (buildingId) => {
  return api.get(`/building/${buildingId}`)
}

// 매물 상세보기 (맵에서 사용하는 엔드포인트)
export const getPropertyDetailForMap = (buildingId) => {
  return api.get(`/map/apt/${buildingId}`)
}

// 매물 상세보기 + 공공데이터 통합 조회 (사진의 매물 정보에 표시되는 모든 정보 포함)
export const getPropertyDetailWithPublicData = (buildingId) => {
  return api.get(`/building/${buildingId}/detail-with-publicdata`)
}

// 매물 찜하기
export const bookmarkProperty = (data) => {
  return api.post('/building/bookmark', data)
}

// 매물 찜하기 취소
export const cancelBookmarkProperty = (buildingId) => {
  return api.delete(`/building/bookmark/${buildingId}`)
}

// 매물 알림 설정
export const setPropertyNotification = (data) => {
  return api.post('/building/notification', data)
}

// 매물 알림 해제
export const cancelPropertyNotification = (buildingId) => {
  return api.delete(`/building/notification/${buildingId}`)
}

// 매물 등록
export const registerProperty = (data) => {
  // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동으로 설정)
  const config =
    data instanceof FormData
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {}

  return api.post('/building/upload', data, config)
}

// 필터링된 매물 리스트
export const getFilteredPropertyList = (params) => {
  return api.get('/building/list', { params })
}

// 매물 삭제
export const deleteProperty = (buildingId) => {
  return api.delete(`/building/remove/${buildingId}`)
}

// 매물 수정
export const updateProperty = (data) => {
  return api.patch('/building/update', data)
}

// 내가 등록한 매물 목록 조회
export const getMyProperties = () => {
  return api.get('/member/mypage/myBuildings')
}
