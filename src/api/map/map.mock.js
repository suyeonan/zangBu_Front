// Mock API for testing without backend
export const mockMapAPI = {
  // Mock 응답 데이터
  getMockResponse: (properties) => {
    return properties.map(property => ({
      address: property.address,
      buildingName: property.buildingName,
      // 고정된 좌표값들 (테스트용)
      lat: getFixedLatitude(property.address),
      lng: getFixedLongitude(property.address)
    }))
  },

  // 필터링된 Mock 응답 데이터
  getFilteredMockResponse: (filterRequest) => {
    // Mock 매물 데이터 생성
    const mockProperties = generateMockProperties()

    // 필터링 적용
    let filteredProperties = mockProperties

    // 거래 유형 필터링
    if (filterRequest.saleTypes && filterRequest.saleTypes.length > 0) {
      filteredProperties = filteredProperties.filter(property =>
        filterRequest.saleTypes.includes(property.saleType)
      )
    }

    // 매물 유형 필터링
    if (filterRequest.propertyTypes && filterRequest.propertyTypes.length > 0) {
      filteredProperties = filteredProperties.filter(property =>
        filterRequest.propertyTypes.includes(property.propertyType)
      )
    }

    // 가격 범위 필터링
    if (filterRequest.priceMin !== undefined && filterRequest.priceMin !== null) {
      filteredProperties = filteredProperties.filter(property =>
        property.price >= filterRequest.priceMin
      )
    }

    if (filterRequest.priceMax !== undefined && filterRequest.priceMax !== null) {
      filteredProperties = filteredProperties.filter(property =>
        property.price <= filterRequest.priceMax
      )
    }

    return filteredProperties
  },

  // 지연 시뮬레이션
  delay: (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))
}

// Mock 매물 데이터 생성 (필터링 테스트용)
function generateMockProperties() {
  const addresses = [
    '서울특별시 강남구 테헤란로 123',
    '서울특별시 마포구 양화로 45',
    '서울특별시 종로구 종로 1',
    '서울특별시 영등포구 여의대로 108',
    '서울특별시 광진구 구의동',
    '서울특별시 강남구 역삼동',
    '서울특별시 서초구 서초동',
    '서울특별시 마포구 합정동',
    '서울특별시 강남구 청담동',
    '서울특별시 송파구 잠실동',
    '서울특별시 성동구 성수동',
    '서울특별시 용산구 이태원동'
  ]
  const buildingNames = [
    '래미안파크 스위트',
    '홍익타워',
    '종로타워',
    '파크원타워',
    '구의건내2 아파트',
    '역삼동 아파트',
    '서초동 빌라',
    '합정동 오피스텔',
    '청담동 주택',
    '잠실 아파트',
    '성수동 오피스텔',
    '이태원 빌라'
  ]

  // 필터링 테스트를 위한 고정된 데이터
  const propertyData = [
    { saleType: '매매', propertyType: '아파트', price: 1500000000, deposit: 0 },
    { saleType: '매매', propertyType: '오피스텔', price: 800000000, deposit: 0 },
    { saleType: '매매', propertyType: '아파트', price: 1200000000, deposit: 0 },
    { saleType: '전세', propertyType: '아파트', price: 0, deposit: 500000000 },
    { saleType: '전세', propertyType: '아파트', price: 0, deposit: 300000000 },
    { saleType: '전세', propertyType: '아파트', price: 0, deposit: 400000000 },
    { saleType: '월세', propertyType: '빌라', price: 50000000, deposit: 10000000 },
    { saleType: '월세', propertyType: '오피스텔', price: 80000000, deposit: 5000000 },
    { saleType: '월세', propertyType: '주택', price: 120000000, deposit: 20000000 },
    { saleType: '매매', propertyType: '아파트', price: 2000000000, deposit: 0 },
    { saleType: '전세', propertyType: '오피스텔', price: 0, deposit: 200000000 },
    { saleType: '월세', propertyType: '빌라', price: 30000000, deposit: 15000000 }
  ]

  return addresses.map((address, index) => ({
    address,
    buildingName: buildingNames[index],
    lat: getFixedLatitude(address),
    lng: getFixedLongitude(address),
    ...propertyData[index]
  }))
}

// 주소 기반으로 고정된 좌표 생성 (필터링 테스트용)
function getFixedLatitude(address) {
  const latMap = {
    '서울특별시 강남구 테헤란로 123': 37.4988799,
    '서울특별시 마포구 양화로 45': 37.550965,
    '서울특별시 종로구 종로 1': 37.570377,
    '서울특별시 영등포구 여의대로 108': 37.521624,
    '서울특별시 광진구 구의동': 37.544477,
    '서울특별시 강남구 역삼동': 37.499950,
    '서울특별시 서초구 서초동': 37.483712,
    '서울특별시 마포구 합정동': 37.549207,
    '서울특별시 강남구 청담동': 37.520641,
    '서울특별시 송파구 잠실동': 37.513829,
    '서울특별시 성동구 성수동': 37.544477,
    '서울특별시 용산구 이태원동': 37.534361
  }
  return latMap[address] || 37.5665
}

function getFixedLongitude(address) {
  const lngMap = {
    '서울특별시 강남구 테헤란로 123': 127.031132,
    '서울특별시 마포구 양화로 45': 126.918425,
    '서울특별시 종로구 종로 1': 126.983389,
    '서울특별시 영등포구 여의대로 108': 126.924191,
    '서울특별시 광진구 구의동': 127.055961,
    '서울특별시 강남구 역삼동': 127.036378,
    '서울특별시 서초구 서초동': 127.032402,
    '서울특별시 마포구 합정동': 126.914223,
    '서울특별시 강남구 청담동': 127.047377,
    '서울특별시 송파구 잠실동': 127.100636,
    '서울특별시 성동구 성수동': 127.055961,
    '서울특별시 용산구 이태원동': 126.994248
  }
  return lngMap[address] || 126.9780
}

// Mock API 함수들
export const getMapListMock = async (properties) => {
  await mockMapAPI.delay(800) // 0.8초 지연

  // 실제 API 응답 형식 시뮬레이션
  const response = mockMapAPI.getMockResponse(properties)

  console.log('Mock API 호출됨:', {
    request: properties,
    response: response
  })

  return response
}

export const getSingleMapLocationMock = async (address, buildingName) => {
  await mockMapAPI.delay(500) // 0.5초 지연

  const response = mockMapAPI.getMockResponse([
    { address, buildingName: buildingName }
  ])

  return response[0]
}

export const getFilteredMapListMock = async (filterRequest) => {

  const response = mockMapAPI.getFilteredMockResponse(filterRequest)

  console.log('Mock 필터링 API 호출됨:', {
    request: filterRequest,
    response: response
  })

  return response
}
