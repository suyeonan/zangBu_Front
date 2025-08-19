import api from '../axios'

// 법정동 코드 조회
export const getLawCodes = async (locataddNm) => {
  try {
    const response = await api.get('/publicdata/law', {
      params: { locataddNm }
    })
    return response.data
  } catch (error) {
    console.error('법정동 코드 조회 실패:', error)
    throw error
  }
}

// 아파트 매매 실거래가 조회
export const getAptTrades = async (locataddNm, dealYmd, pageNo = 1, numOfRows = 100) => {
  try {
    const response = await api.get('/publicdata/apt/trade', {
      params: { locataddNm, dealYmd, pageNo, numOfRows }
    })
    return response.data
  } catch (error) {
    console.error('아파트 실거래가 조회 실패:', error)
    throw error
  }
}

// 아파트 월세 실거래가 조회
export const getAptRents = async (locataddNm, dealYmd) => {
  try {
    const response = await api.get('/publicdata/apt/rent', {
      params: { locataddNm, dealYmd }
    })
    return response.data
  } catch (error) {
    console.error('아파트 월세 실거래가 조회 실패:', error)
    throw error
  }
}

// 오피스텔 매매 실거래가 조회
export const getOfficeTrades = async (locataddNm, dealYmd, pageNo = 1, numOfRows = 100) => {
  try {
    const response = await api.get('/publicdata/office/trade', {
      params: { locataddNm, dealYmd, pageNo, numOfRows }
    })
    return response.data
  } catch (error) {
    console.error('오피스텔 매매 실거래가 조회 실패:', error)
    throw error
  }
}

// 빌라/연립 매매 실거래가 조회
export const getVillaTrades = async (locataddNm, dealYmd) => {
  try {
    const response = await api.get('/publicdata/villa/trade', {
      params: { locataddNm, dealYmd }
    })
    return response.data
  } catch (error) {
    console.error('빌라/연립 매매 실거래가 조회 실패:', error)
    throw error
  }
}

// 🆕 공공데이터 통합 정보 조회 (사진의 모든 매물 정보 포함)
export const getCompleteAptInfo = async (address) => {
  try {
    console.log('🌐 공공데이터 통합 정보 조회 중...', address)
    const response = await api.get('/publicdata/integration/apt-info', {
      params: { address }
    })
    console.log('✅ 공공데이터 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 공공데이터 통합 정보 조회 실패:', error)
    throw error
  }
}

// 🆕 매물 ID로 통합 정보 조회
export const getPropertyInfoByBuildingId = async (buildingId) => {
  try {
    console.log('🏠 매물 ID로 통합 정보 조회 중...', buildingId)
    const response = await api.get(`/publicdata/integration/property/${buildingId}`)
    console.log('✅ 매물 정보 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 매물 정보 조회 실패:', error)
    throw error
  }
}

// 🆕 아파트 실거래가 정보 조회 (해당 구의 평균 시세)
export const getAptTradeInfo = async (complexPk, dealYearMonth) => {
  try {
    console.log('💰 아파트 실거래가 정보 조회 중...', { complexPk, dealYearMonth })
    const response = await api.get('/publicdata/integration/apt-trade', {
      params: { complexPk, dealYearMonth }
    })
    console.log('✅ 실거래가 정보 조회 성공:', response.data)

    // 시세 정보의 정확한 의미를 명시
    if (response.data.success) {
      response.data.note = "해당 법정동의 평균 시세 정보입니다. 개별 매물 시세가 아닙니다."
      response.data.type = "area_average" // 구역 평균 시세
    }

    return response.data
  } catch (error) {
    console.error('❌ 실거래가 정보 조회 실패:', error)
    throw error
  }
}

// 🆕 아파트 단지 정보 조회
export const getAptComplexInfo = async (address) => {
  try {
    console.log('🏢 아파트 단지 정보 조회 중...', address)
    const response = await api.get('/publicdata/aptidinfo/info', {
      params: {
        adres: address,
        page: 1,
        perPage: 10
      }
    })
    console.log('✅ 단지 정보 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 단지 정보 조회 실패:', error)
    throw error
  }
}

// 🆕 동 정보 조회
export const getDongInfo = async (complexPk) => {
  try {
    console.log('🏘️ 동 정보 조회 중...', complexPk)
    const response = await api.get('/publicdata/aptidinfo/dong', {
      params: {
        complexPk,
        page: 1,
        perPage: 10
      }
    })
    console.log('✅ 동 정보 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 동 정보 조회 실패:', error)
    throw error
  }
}

// 🆕 실제 매물의 개별 가격 정보 조회
export const getActualPropertyPrice = async (complexPk, dongName, hoNumber) => {
  try {
    console.log('💰 개별 매물 가격 조회 중...', { complexPk, dongName, hoNumber })
    const response = await api.get('/publicdata/integration/actual-price', {
      params: { complexPk, dongName, hoNumber }
    })
    console.log('✅ 개별 매물 가격 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 개별 매물 가격 조회 실패:', error)
    throw error
  }
}

// 🆕 부동산 중개업소 API로 실제 매물 정보 조회
export const getRealEstatePropertyInfo = async (address, buildingName) => {
  try {
    console.log('🏠 중개업소 매물 정보 조회 중...', { address, buildingName })
    const response = await api.get('/publicdata/integration/real-estate-property', {
      params: { address, buildingName }
    })
    console.log('✅ 중개업소 매물 정보 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 중개업소 매물 정보 조회 실패:', error)
    throw error
  }
}
