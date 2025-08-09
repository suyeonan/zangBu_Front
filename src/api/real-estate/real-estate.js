import axios from '../axios'

/**
 * 실제 부동산 건물 정보 조회
 * @param {Object} buildingInfo - 건물 정보
 * @param {string} buildingInfo.buildingName - 건물명
 * @param {string} buildingInfo.sido - 시도
 * @param {string} buildingInfo.sigungu - 시군구
 * @param {string} buildingInfo.eupmyeondong - 읍면동
 * @param {string} buildingInfo.roadAddress - 도로명주소
 * @returns {Promise<Object>} 실제 부동산 정보
 */
export const fetchBuildingInfo = async (buildingInfo) => {
  try {
    console.log('🏢 실제 부동산 정보 API 호출:', buildingInfo)

    // 1차: 국토교통부 실거래가 API 시도
    const realTradeData = await fetchRealTradeData(buildingInfo)
    if (realTradeData.success) {
      return {
        success: true,
        data: {
          availableDong: realTradeData.dong,
          availableHo: realTradeData.ho,
          availableArea: realTradeData.area,
          buildingInfo: realTradeData.buildingInfo,
          dataSource: 'real_trade_api',
        },
      }
    }

    // 2차: 부동산 정보 제공업체 API 시도 (예: 네이버, 다음 등)
    const propertyData = await fetchPropertyPortalData(buildingInfo)
    if (propertyData.success) {
      return {
        success: true,
        data: {
          availableDong: propertyData.dong,
          availableHo: propertyData.ho,
          availableArea: propertyData.area,
          buildingInfo: propertyData.buildingInfo,
          dataSource: 'property_portal',
        },
      }
    }

    // 3차: 웹 스크래핑 또는 캐시된 데이터 시도
    const cachedData = await fetchCachedBuildingData(buildingInfo)
    if (cachedData.success) {
      return {
        success: true,
        data: {
          availableDong: cachedData.dong,
          availableHo: cachedData.ho,
          availableArea: cachedData.area,
          buildingInfo: cachedData.buildingInfo,
          dataSource: 'cached_data',
        },
      }
    }

    // 모든 방법 실패 시
    return {
      success: false,
      message: '실제 부동산 정보를 찾을 수 없습니다.',
      error: 'NO_DATA_FOUND',
    }
  } catch (error) {
    console.error('🚨 실제 부동산 정보 조회 오류:', error)
    return {
      success: false,
      message: '부동산 정보 조회 중 오류가 발생했습니다.',
      error: error.message,
    }
  }
}

/**
 * 국토교통부 실거래가 API에서 건물 정보 조회
 */
const fetchRealTradeData = async (buildingInfo) => {
  try {
    // 국토교통부 아파트매매 실거래자료 API
    const response = await axios.get('/real-estate/apartment-trade', {
      params: {
        LAWD_CD: buildingInfo.regionCode, // 지역코드 (시군구코드)
        DEAL_YMD: new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0'), // 최근 월
        serviceKey: process.env.VUE_APP_MOLIT_API_KEY, // 국토교통부 API 키
      },
    })

    if (response.data && response.data.response && response.data.response.body) {
      const items = response.data.response.body.items.item || []

      // 해당 건물명과 일치하는 데이터 필터링
      const matchingData = items.filter(
        (item) => item.아파트 && item.아파트.includes(buildingInfo.buildingName)
      )

      if (matchingData.length > 0) {
        // 실거래 데이터에서 동/호수/면적 정보 추출
        const dongSet = new Set()
        const hoSet = new Set()
        const areaSet = new Set()

        matchingData.forEach((item) => {
          if (item.동) dongSet.add(item.동.toString())
          if (item.호수) hoSet.add(item.호수.toString())
          if (item.전용면적) areaSet.add(parseFloat(item.전용면적).toString())
        })

        return {
          success: true,
          dong: Array.from(dongSet).sort((a, b) => parseInt(a) - parseInt(b)),
          ho: Array.from(hoSet).sort(),
          area: Array.from(areaSet).sort((a, b) => parseFloat(a) - parseFloat(b)),
          buildingInfo: {
            name: buildingInfo.buildingName,
            address: buildingInfo.roadAddress,
            totalUnits: matchingData.length,
            lastTradeDate: matchingData[0].거래일,
          },
        }
      }
    }

    return { success: false }
  } catch (error) {
    console.error('국토교통부 API 호출 오류:', error)
    return { success: false }
  }
}

/**
 * 부동산 포털 사이트에서 건물 정보 조회
 */
const fetchPropertyPortalData = async (buildingInfo) => {
  try {
    // 부동산 포털 API 호출 (예: 네이버 부동산, 다음 부동산)
    const response = await axios.post('/real-estate/portal-search', {
      buildingName: buildingInfo.buildingName,
      address: buildingInfo.roadAddress,
      sido: buildingInfo.sido,
      sigungu: buildingInfo.sigungu,
    })

    if (response.data && response.data.success) {
      const data = response.data.data

      return {
        success: true,
        dong: data.availableDong || [],
        ho: data.availableHo || [],
        area: data.availableArea || [],
        buildingInfo: {
          name: data.buildingName,
          address: data.address,
          buildingType: data.buildingType,
          totalFloors: data.totalFloors,
          totalUnits: data.totalUnits,
          completionYear: data.completionYear,
        },
      }
    }

    return { success: false }
  } catch (error) {
    console.error('부동산 포털 API 호출 오류:', error)
    return { success: false }
  }
}

/**
 * 캐시된 건물 데이터 조회
 */
const fetchCachedBuildingData = async (buildingInfo) => {
  try {
    // 로컬 데이터베이스나 캐시에서 건물 정보 조회
    const response = await axios.get('/real-estate/cached-building', {
      params: {
        buildingName: buildingInfo.buildingName,
        sido: buildingInfo.sido,
        sigungu: buildingInfo.sigungu,
      },
    })

    if (response.data && response.data.success) {
      const data = response.data.data

      return {
        success: true,
        dong: data.dong || [],
        ho: data.ho || [],
        area: data.area || [],
        buildingInfo: data.buildingInfo || {},
      }
    }

    return { success: false }
  } catch (error) {
    console.error('캐시된 데이터 조회 오류:', error)
    return { success: false }
  }
}

/**
 * 지역코드 조회 (시군구 → 코드 변환)
 */
export const getRegionCode = async (sido, sigungu) => {
  try {
    const response = await axios.get('/real-estate/region-code', {
      params: { sido, sigungu },
    })

    if (response.data && response.data.success) {
      return response.data.data.code
    }

    return null
  } catch (error) {
    console.error('지역코드 조회 오류:', error)
    return null
  }
}

/**
 * 아파트 단지 상세 정보 조회
 */
export const getApartmentComplexInfo = async (complexName, sido, sigungu) => {
  try {
    const response = await axios.post('/real-estate/complex-info', {
      complexName,
      sido,
      sigungu,
    })

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
      }
    }

    return {
      success: false,
      message: '아파트 단지 정보를 찾을 수 없습니다.',
    }
  } catch (error) {
    console.error('아파트 단지 정보 조회 오류:', error)
    return {
      success: false,
      message: '단지 정보 조회 중 오류가 발생했습니다.',
      error: error.message,
    }
  }
}
