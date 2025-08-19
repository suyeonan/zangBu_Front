import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getFilteredPropertyList,
  getPropertyDetail,
  getPropertyDetailById,
  registerProperty,
  updateProperty as updatePropertyApi,
  deleteProperty as deletePropertyApi,
  bookmarkProperty as bookmarkPropertyApi,
  cancelBookmarkProperty as cancelBookmarkPropertyApi,
  getMyProperties as getMyPropertiesApi,
} from '@/api/property/property'

export const usePropertyStore = defineStore('property', () => {
  // 매물 목록
  const properties = ref([])
  // 현재 선택된 매물 상세 정보
  const currentProperty = ref(null)
  // 매물 검색 필터
  const propertyFilters = ref({})
  // 로딩 상태
  const loading = ref(false)
  // 에러 상태
  const error = ref(null)

  // 필터링된 매물 목록 조회
  async function fetchProperties(params) {
    loading.value = true
    error.value = null
    try {
      const res = await getFilteredPropertyList(params)
      properties.value = res.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 매물 상세 정보 조회
  async function fetchPropertyDetail(params) {
    loading.value = true
    error.value = null
    try {
      const res = await getPropertyDetail(params)
      currentProperty.value = res.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 신규 매물 등록
  async function createProperty(data) {
    loading.value = true
    error.value = null
    try {
      const response = await registerProperty(data)
      return { success: true, data: response.data, status: response.status }
    } catch (err) {
      error.value = err
      return { success: false, message: err.response?.data?.message || '매물 등록에 실패했습니다.' }
    } finally {
      loading.value = false
    }
  }

  // 매물 삭제
  async function removeProperty(buildingId) {
    loading.value = true
    error.value = null
    try {
      await deletePropertyApi(buildingId)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 매물 찜하기
  async function bookmarkProperty(data) {
    loading.value = true
    error.value = null
    try {
      await bookmarkPropertyApi(data)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 매물 찜하기 취소
  async function cancelBookmark(buildingId) {
    loading.value = true
    error.value = null
    try {
      await cancelBookmarkPropertyApi(buildingId)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 검색 필터 설정
  function setFilters(filters) {
    propertyFilters.value = filters
  }

  // 매물 ID로 상세 정보 조회
  async function fetchProperty(id) {
    loading.value = true
    error.value = null
    try {
      const res = await getPropertyDetailById(id)
      return res.data
    } catch (err) {
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  // 매물 수정
  async function updateProperty(data) {
    loading.value = true
    error.value = null
    try {
      const response = await updatePropertyApi(data)
      return { success: true, data: response.data, status: response.status }
    } catch (err) {
      error.value = err
      return { success: false, message: err.response?.data?.message || '매물 수정에 실패했습니다.' }
    } finally {
      loading.value = false
    }
  }

  // 내가 등록한 매물 목록 조회
  async function fetchMyProperties() {
    loading.value = true
    error.value = null
    try {
      const response = await getMyPropertiesApi()
      return { success: true, data: response.data, status: response.status }
    } catch (err) {
      error.value = err
      return {
        success: false,
        message: err.response?.data?.message || '내 매물 목록을 불러오는데 실패했습니다.',
      }
    } finally {
      loading.value = false
    }
  }

  return {
    properties,
    currentProperty,
    propertyFilters,
    loading,
    error,
    fetchProperties,
    fetchPropertyDetail,
    createProperty,
    removeProperty,
    bookmarkProperty,
    cancelBookmark,
    setFilters,
    fetchProperty,
    updateProperty,
    fetchMyProperties,
  }
})
