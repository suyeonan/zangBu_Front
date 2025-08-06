import api from '../axios.js'
import { getMapListMock, getSingleMapLocationMock, getFilteredMapListMock } from './map.mock.js'

// 개발 환경에서 Mock 사용 여부 (환경변수로 제어)
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

/**
 * 매물 목록을 위한 지도 좌표 조회 (기존 API - 하위 호환성)
 * @param {Array} properties - 주소와 건물명이 포함된 매물 배열
 * @returns {Promise} 위도, 경도가 포함된 매물 배열
 */
export const getMapList = async (properties) => {
  // Mock API 사용
  if (USE_MOCK) {
    console.log('🔧 Mock API 사용 중...')
    return await getMapListMock(properties)
  }

  // 실제 API 사용
  try {
    console.log('🌐 실제 API 호출 중...')
    const response = await api.post('/map/list', properties)
    return response.data
  } catch (error) {
    console.error('매물 지도 정보 조회 실패:', error)

    // API 실패 시 Mock으로 대체 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('⚠️ API 실패로 Mock 데이터 사용')
      return await getMapListMock(properties)
    }

    throw error
  }
}

/**
 * 필터링된 매물 목록 조회 (새로운 API)
 * @param {Object} filterRequest - 필터링 조건
 * @param {Array} filterRequest.saleTypes - 거래 유형 (매매, 전세, 월세)
 * @param {Array} filterRequest.propertyTypes - 매물 유형 (아파트, 오피스텔, 주택, 빌라)
 * @param {number} filterRequest.priceMin - 최소 가격 (원)
 * @param {number} filterRequest.priceMax - 최대 가격 (원)
 * @returns {Promise} 필터링된 매물 목록
 */
export const getFilteredMapList = async (filterRequest) => {
  // Mock API 사용
  if (USE_MOCK) {
    console.log('🔧 Mock API 사용 중...')
    return await getFilteredMapListMock(filterRequest)
  }

  // 실제 API 사용
  try {
    console.log('🌐 필터링 API 호출 중...', filterRequest)
    const response = await api.post('/map', filterRequest)
    return response.data
  } catch (error) {
    console.error('필터링된 매물 조회 실패:', error)

    // API 실패 시 Mock으로 대체 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('⚠️ API 실패로 Mock 데이터 사용')
      return await getFilteredMapListMock(filterRequest)
    }

    throw error
  }
}

/**
 * 단일 매물의 지도 좌표 조회
 * @param {string} address - 주소
 * @param {string} buildingName - 건물명
 * @returns {Promise} 위도, 경도가 포함된 매물 정보
 */
export const getSingleMapLocation = async (address, buildingName) => {
  // Mock API 사용
  if (USE_MOCK) {
    console.log('🔧 Mock API 사용 중...')
    return await getSingleMapLocationMock(address, buildingName)
  }

  // 실제 API 사용
  try {
    console.log('🌐 실제 API 호출 중...')
    const response = await api.post('/map/list', [
      {
        address,
        buildingName: buildingName
      }
    ])
    return response.data[0]
  } catch (error) {
    console.error('매물 좌표 조회 실패:', error)

    // API 실패 시 Mock으로 대체 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('⚠️ API 실패로 Mock 데이터 사용')
      return await getSingleMapLocationMock(address, buildingName)
    }

    throw error
  }
}
