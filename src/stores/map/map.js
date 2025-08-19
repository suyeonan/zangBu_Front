import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { getMapList, getSingleMapLocation, getFilteredMapList } from '@/api/map/map.js'

export const useMapStore = defineStore('map', () => {
  // 상태
  const properties = ref([])
  const filteredProperties = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 필터 상태
  const filters = reactive({
    propertyTypes: {
      apartment: false,
      officetel: false,
      house: false,
      villa: false
    },
    transactionTypes: {
      sale: false,      // 매매
      lease: false,     // 전세
      rent: false       // 월세
    },
    priceRange: {
      min: 0,
      max: 50
    },
    searchQuery: ''
  })

  // 지도 상태
  const mapCenter = ref({
    lat: 37.5665,
    lng: 126.9780
  })

  const mapLevel = ref(8)

  // 액션
  const fetchProperties = async () => {
    try {
      error.value = null

      const response = await getMapList();
      properties.value = response
      filteredProperties.value = response

      return response
    } catch (err) {
      error.value = err.message || '매물을 불러오는데 실패했습니다.'
      console.error('매물 데이터 로드 실패:', err)
      throw err
    }
  }

  const fetchSingleProperty = async (address, buildingName) => {
    try {
      error.value = null

      const response = await getSingleMapLocation(address, buildingName)
      return response
    } catch (err) {
      error.value = err.message || '매물 좌표를 불러오는데 실패했습니다.'
      console.error('매물 좌표 로드 실패:', err)
      throw err
    }
  }

  // 필터링된 매물 조회 (새로운 API 사용)
  const fetchFilteredProperties = async () => {
    try {
      loading.value = true
      error.value = null

      // UI 필터 상태를 API 요청 형식으로 변환
      const propertyTypes = Object.entries(filters.propertyTypes)
        .filter(([, checked]) => checked)
        .map(([type]) => type.toUpperCase()) // 대문자로 변환

      const saleTypes = Object.entries(filters.transactionTypes)
        .filter(([, checked]) => checked)
        .map(([type]) => { // 프론트엔드 값 -> 백엔드 ENUM 값
          if (type === 'sale') return 'TRADING'
          if (type === 'lease') return 'CHARTER'
          if (type === 'rent') return 'MONTHLY'
          return type.toUpperCase()
        })

      const filterRequest = {
        propertyTypes,
        saleTypes,
        priceMin: filters.priceRange.min,
        priceMax: filters.priceRange.max,
      }

      console.log('필터링 API 요청:', filterRequest)

      const response = await getFilteredMapList(filterRequest)
      filteredProperties.value = response

      return response
    } catch (err) {
      error.value = err.message || '필터링된 매물을 불러오는데 실패했습니다.'
      console.error('필터링된 매물 로드 실패:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 필터 적용 (기존 클라이언트 사이드 필터링)
  const applyFilters = () => {
    let filtered = [...properties.value]

    // 검색어 필터
    if (filters.searchQuery.trim()) {
      filtered = filtered.filter(property =>
        property.address.includes(filters.searchQuery) ||
        property.buildingName.includes(filters.searchQuery)
      )
    }

    // 매물 유형 필터 (체크된 것이 있을 때만 적용)
    const selectedPropertyTypes = Object.entries(filters.propertyTypes)
      .filter(([_, checked]) => checked)
      .map(([type, _]) => type)

    if (selectedPropertyTypes.length > 0) {
      // 실제로는 API에서 매물 유형 정보를 받아와야 함
      // 여기서는 샘플 로직
      filtered = filtered.filter(property => {
        // 임시로 건물명에 따라 유형 판단
        if (selectedPropertyTypes.includes('apartment') &&
            (property.buildingName.includes('아파트') || property.buildingName.includes('APT'))) {
          return true
        }
        if (selectedPropertyTypes.includes('officetel') &&
            property.buildingName.includes('오피스텔')) {
          return true
        }
        if (selectedPropertyTypes.includes('house') &&
            property.buildingName.includes('주택')) {
          return true
        }
        if (selectedPropertyTypes.includes('villa') &&
            property.buildingName.includes('빌라')) {
          return true
        }
        return selectedPropertyTypes.length === 0
      })
    }

    // 거래 유형 필터
    const selectedTransactionTypes = Object.entries(filters.transactionTypes)
      .filter(([_, checked]) => checked)
      .map(([type, _]) => type)

    if (selectedTransactionTypes.length > 0) {
      // 실제로는 API에서 거래 유형 정보를 받아와야 함
      // 임시 로직으로 모든 매물 표시
    }

    // 가격 범위 필터
    if (filters.priceRange.min > 0 || filters.priceRange.max < 50) {
      // 실제로는 API에서 가격 정보를 받아와야 함
      // 임시 로직으로 모든 매물 표시
    }

    filteredProperties.value = filtered
  }

  // 필터 초기화
  const resetFilters = () => {
    filters.propertyTypes.apartment = false
    filters.propertyTypes.officetel = false
    filters.propertyTypes.house = false
    filters.propertyTypes.villa = false

    filters.transactionTypes.sale = false
    filters.transactionTypes.lease = false
    filters.transactionTypes.rent = false

    filters.priceRange.min = 0
    filters.priceRange.max = 50
    filters.searchQuery = ''

    // 필터 초기화 시 전체 매물 다시 로드
    fetchFilteredProperties()
  }

  // 지도 중심 변경
  const setMapCenter = (lat, lng) => {
    mapCenter.value = { lat, lng }
  }

  // 지도 레벨 변경
  const setMapLevel = (level) => {
    mapLevel.value = level
  }

  // 검색어 설정
  const setSearchQuery = (query) => {
    filters.searchQuery = query
    applyFilters()
  }

  return {
    // 상태
    properties,
    filteredProperties,
    error,
    filters,
    mapCenter,
    mapLevel,

    // 액션
    fetchProperties,
    fetchSingleProperty,
    fetchFilteredProperties,
    applyFilters,
    resetFilters,
    setMapCenter,
    setMapLevel,
    setSearchQuery
  }
})
