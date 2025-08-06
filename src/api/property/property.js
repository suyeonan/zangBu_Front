import api from '../axios'

// 매물 상세보기
export const getPropertyDetail = (params) => {
  return api.post('/building', params)
}

// 매물 상세보기 (buildingId로 조회)
export const getPropertyDetailById = (buildingId) => {
  return api.get(`/building/${buildingId}`)
}

// 매물 찜하기
export const bookmarkProperty = (data) => {
  return api.post('/building/bookmark', data)
}

// 매물 찜하기 취소
export const cancelBookmarkProperty = (buildingId) => {
  return api.delete(`/building/bookmark/${buildingId}`)
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
