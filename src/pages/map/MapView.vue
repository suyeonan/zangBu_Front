<!--
  지도 뷰 컴포넌트

  설정 방법:
  1. 카카오 개발자 사이트(https://developers.kakao.com/)에서 앱 등록
  2. 웹 플랫폼 추가 및 사이트 도메인 등록
  3. .env 파일에 VITE_KAKAO_MAP_API_KEY=여러분의_API_키 추가
  4. npm run dev로 개발 서버 재시작

  주요 기능:
  - 매물 위치 지도 표시
  - 필터링 (매물 유형, 거래 유형, 가격 범위)
  - 검색 기능
  - 마커 클릭 시 상세 정보 표시
-->

<!-- 리뷰 이동 기능 참고하기
router.push()를 사용하여 Vue Router로 페이지 이동
selectedProperty.value가 존재할 때만 리뷰 페이지로 이동
-->

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useMapStore } from '@/stores/map/map.js'
import { useRouter, useRoute } from 'vue-router'
import { getPropertyDetailById } from '@/api/property/property.js'

// Props 정의
const props = defineProps({
  buildingId: {
    type: String,
    default: null,
  },
})

// Store 사용
const mapStore = useMapStore()
const router = useRouter()
const route = useRoute()

// 상세 보기 상태
const showDetail = ref(false)
const selectedProperty = ref(null)

// 지도 관련
const mapContainer = ref(null)
const map = ref(null)
const markers = ref([])

// Computed
const searchQuery = computed({
  get: () => mapStore.filters.searchQuery,
  set: (value) => mapStore.setSearchQuery(value),
})

const filteredProperties = computed(() => mapStore.filteredProperties)

// 카카오 맵 초기화
const initMap = () => {
  if (window.kakao && window.kakao.maps) {
    const container = mapContainer.value
    const options = {
      center: new window.kakao.maps.LatLng(mapStore.mapCenter.lat, mapStore.mapCenter.lng),
      level: mapStore.mapLevel,
    }

    map.value = new window.kakao.maps.Map(container, options)
  }
}

// 마커 생성 및 표시
const displayMarkers = (mapData) => {
  // 기존 마커 제거
  markers.value.forEach((marker) => marker.setMap(null))
  markers.value = []

  mapData.forEach((property) => {
    const position = new window.kakao.maps.LatLng(property.lat, property.lng)

    // 마커 생성
    const marker = new window.kakao.maps.Marker({
      position: position,
      map: map.value,
    })

    // 인포윈도우 생성
    const infoWindow = new window.kakao.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px; position: relative;">
          <button
            id="closeBtn_${property.buildingName.replace(/\s+/g, '_')}"
            style="
              position: absolute;
              top: 5px;
              right: 5px;
              background: none;
              border: none;
              font-size: 16px;
              cursor: pointer;
              color: #999;
              padding: 2px 6px;
              border-radius: 3px;
              line-height: 1;
              z-index: 1000;
            "
            title="닫기"
          >
            ×
          </button>
          <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; padding-right: 20px;">
            ${property.buildingName}
          </h4>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${property.address}
          </p>
          <p style="margin: 3px 0; font-size: 11px; color: #888;">
            ${property.propertyType} | ${property.saleType}
          </p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #007bff; font-weight: bold;">
            ${generatePropertyInfo(property)}
          </p>
          <button
            id="detailBtn_${property.buildingName.replace(/\s+/g, '_')}"
            style="
              width: 100%;
              margin-top: 8px;
              padding: 6px 12px;
              background: #4caf50;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
              transition: background-color 0.2s;
            "
            title="상세 보기"
          >
            상세 보기
          </button>
        </div>
      `,
    })

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      // 다른 인포윈도우들 닫기
      markers.value.forEach((otherMarker) => {
        if (otherMarker.infoWindow && otherMarker.infoWindow !== infoWindow) {
          otherMarker.infoWindow.close()
        }
      })

      infoWindow.open(map.value, marker)

      // 닫기 버튼 이벤트 리스너 추가
      setTimeout(() => {
        const closeBtn = document.getElementById(
          `closeBtn_${property.buildingName.replace(/\s+/g, '_')}`
        )
        if (closeBtn) {
          // 이벤트 리스너 제거 후 다시 추가
          const newCloseBtn = closeBtn.cloneNode(true)
          closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn)

          newCloseBtn.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            infoWindow.close()
          })

          // 호버 효과 추가
          newCloseBtn.addEventListener('mouseover', () => {
            newCloseBtn.style.color = '#666'
            newCloseBtn.style.backgroundColor = '#f0f0f0'
          })

          newCloseBtn.addEventListener('mouseout', () => {
            newCloseBtn.style.color = '#999'
            newCloseBtn.style.backgroundColor = 'transparent'
          })

          // 상세 보기 버튼 이벤트 리스너 추가
          const detailBtn = document.getElementById(
            `detailBtn_${property.buildingName.replace(/\s+/g, '_')}`
          )
          if (detailBtn) {
            const newDetailBtn = detailBtn.cloneNode(true)
            detailBtn.parentNode.replaceChild(newDetailBtn, detailBtn)

            newDetailBtn.addEventListener('click', (e) => {
              e.preventDefault()
              e.stopPropagation()
              showPropertyDetail(property)
            })

            // 호버 효과 추가
            newDetailBtn.addEventListener('mouseover', () => {
              newDetailBtn.style.backgroundColor = '#45a049'
            })

            newDetailBtn.addEventListener('mouseout', () => {
              newDetailBtn.style.backgroundColor = '#4caf50'
            })
          }
        }
      }, 100)
    })

    // 인포윈도우를 마커에 저장
    marker.infoWindow = infoWindow
    markers.value.push(marker)
  })
}

// 매물 정보 표시용 가격 생성
const generatePropertyInfo = (property) => {
  if (property.saleType === '매매') {
    return `${(property.price / 100000000).toFixed(1)}억`
  } else if (property.saleType === '전세') {
    return `전세 ${(property.deposit / 100000000).toFixed(1)}억`
  } else if (property.saleType === '월세') {
    return `월세 ${(property.price / 10000).toFixed(0)}만/${(property.deposit / 100000000).toFixed(
      1
    )}억`
  }
  return '가격 정보 없음'
}

// 샘플 매물 데이터 (필터링 테스트용)
const sampleProperties = [
  // 매매 매물들
  {
    address: '서울특별시 강남구 테헤란로 123',
    buildingName: '래미안파크 스위트',
    buildingId: 1,
    saleType: '매매',
    propertyType: '아파트',
    price: 1500000000,
    deposit: 0,
  },
  {
    address: '서울특별시 마포구 양화로 45',
    buildingName: '홍익타워',
    buildingId: 2,
    saleType: '매매',
    propertyType: '오피스텔',
    price: 800000000,
    deposit: 0,
  },
  {
    address: '서울특별시 종로구 종로 1',
    buildingName: '종로타워',
    buildingId: 3,
    saleType: '매매',
    propertyType: '아파트',
    price: 1200000000,
    deposit: 0,
  },

  // 전세 매물들
  {
    address: '서울특별시 영등포구 여의대로 108',
    buildingName: '파크원타워',
    buildingId: 4,
    saleType: '전세',
    propertyType: '아파트',
    price: 0,
    deposit: 500000000,
  },
  {
    address: '서울특별시 광진구 구의동',
    buildingName: '구의건내2 아파트',
    buildingId: 5,
    saleType: '전세',
    propertyType: '아파트',
    price: 0,
    deposit: 300000000,
  },
  {
    address: '서울특별시 강남구 역삼동',
    buildingName: '역삼동 아파트',
    buildingId: 6,
    saleType: '전세',
    propertyType: '아파트',
    price: 0,
    deposit: 400000000,
  },

  // 월세 매물들
  {
    address: '서울특별시 서초구 서초동',
    buildingName: '서초동 빌라',
    buildingId: 7,
    saleType: '월세',
    propertyType: '빌라',
    price: 50000000,
    deposit: 10000000,
  },
  {
    address: '서울특별시 마포구 합정동',
    buildingName: '합정동 오피스텔',
    buildingId: 8,
    saleType: '월세',
    propertyType: '오피스텔',
    price: 80000000,
    deposit: 5000000,
  },
  {
    address: '서울특별시 강남구 청담동',
    buildingName: '청담동 주택',
    buildingId: 9,
    saleType: '월세',
    propertyType: '주택',
    price: 120000000,
    deposit: 20000000,
  },

  // 추가 매물들 (다양한 조합)
  {
    address: '서울특별시 송파구 잠실동',
    buildingName: '잠실 아파트',
    buildingId: 10,
    saleType: '매매',
    propertyType: '아파트',
    price: 2000000000,
    deposit: 0,
  },
  {
    address: '서울특별시 성동구 성수동',
    buildingName: '성수동 오피스텔',
    buildingId: 11,
    saleType: '전세',
    propertyType: '오피스텔',
    price: 0,
    deposit: 200000000,
  },
  {
    address: '서울특별시 용산구 이태원동',
    buildingName: '이태원 빌라',
    buildingId: 12,
    saleType: '월세',
    propertyType: '빌라',
    price: 30000000,
    deposit: 15000000,
  },
]

// 매물명을 buildingId로 매핑하는 함수
const getBuildingIdByName = (buildingName) => {
  const property = sampleProperties.find((p) => p.buildingName === buildingName)
  const buildingId = property ? property.buildingId : null

  // 디버깅용 로그
  console.log('매물명 매핑:', { buildingName, buildingId })

  return buildingId
}

// 매물 데이터 로드
const loadProperties = async () => {
  try {
    // 초기 로드 시에는 필터링 없이 전체 매물 표시
    const mapData = await mapStore.fetchProperties(sampleProperties)
    displayMarkers(mapData)

    // 필터링된 매물도 초기화
    mapStore.filteredProperties = mapData
  } catch (error) {
    alert('매물을 불러오는데 실패했습니다.')
  }
}

// 필터 적용 (새로운 API 사용)
const applyFilters = async () => {
  try {
    await mapStore.fetchFilteredProperties()
    displayMarkers(filteredProperties.value)
  } catch (error) {
    console.error('필터 적용 실패:', error)
    alert('필터를 적용하는데 실패했습니다.')
  }
}

// 초기화 함수
const initializeKakaoMap = () => {
  if (window.kakao && window.kakao.maps) {
    window.kakao.maps.load(() => {
      initMap()
      loadProperties()
    })
  } else {
    // 카카오 맵 스크립트 로드 (환경변수에서 API 키를 가져옵니다)
    const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY || 'YOUR_APP_KEY'
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        initMap()
        loadProperties()
      })
    }
    document.head.appendChild(script)
  }
}

// 검색 함수
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('검색어:', searchQuery.value)
    mapStore.setSearchQuery(searchQuery.value)
  }
}

// 매물 유형 토글
const togglePropertyType = (type) => {
  mapStore.filters.propertyTypes[type] = !mapStore.filters.propertyTypes[type]
}

// 거래 유형 토글
const toggleTransactionType = (type) => {
  mapStore.filters.transactionTypes[type] = !mapStore.filters.transactionTypes[type]
}

// 가격 범위 검증 및 조정
const validatePriceRange = () => {
  const min = mapStore.filters.priceRange.min
  const max = mapStore.filters.priceRange.max

  // 최소값이 최대값보다 클 경우 조정
  if (min > max) {
    mapStore.filters.priceRange.max = min
  }

  // 범위 제한 (0-50)
  if (min < 0) mapStore.filters.priceRange.min = 0
  if (min > 50) mapStore.filters.priceRange.min = 50
  if (max < 0) mapStore.filters.priceRange.max = 0
  if (max > 50) mapStore.filters.priceRange.max = 50
}

// 최소 가격 감소
const decreaseMinPrice = () => {
  if (mapStore.filters.priceRange.min > 0) {
    mapStore.filters.priceRange.min--
    validatePriceRange()
  }
}

// 최소 가격 증가
const increaseMinPrice = () => {
  if (mapStore.filters.priceRange.min < mapStore.filters.priceRange.max) {
    mapStore.filters.priceRange.min++
    validatePriceRange()
  }
}

// 최대 가격 감소
const decreaseMaxPrice = () => {
  if (mapStore.filters.priceRange.max > mapStore.filters.priceRange.min) {
    mapStore.filters.priceRange.max--
    validatePriceRange()
  }
}

// 최대 가격 증가
const increaseMaxPrice = () => {
  if (mapStore.filters.priceRange.max < 50) {
    mapStore.filters.priceRange.max++
    validatePriceRange()
  }
}

// 필터 초기화
const resetFilters = async () => {
  try {
    await mapStore.resetFilters()
    displayMarkers(filteredProperties.value)
  } catch (error) {
    console.error('필터 초기화 실패:', error)
    alert('필터를 초기화하는데 실패했습니다.')
  }
}

// 집 내놓기 페이지로 이동
const goToUpload = () => {
  router.push('/building/upload')
}

// 매물 상세 정보 가져오기
const fetchPropertyDetail = async (buildingId) => {
  try {
    console.log('매물 상세 정보 가져오기 시작:', buildingId)
    const response = await getPropertyDetailById(buildingId)
    console.log('API 응답:', response)
    if (response && response.data) {
      selectedProperty.value = response.data
      showDetail.value = true
    } else {
      console.warn('매물 데이터가 없습니다.')
    }
  } catch (error) {
    console.error('매물 상세 정보 가져오기 실패:', error)
    // alert 제거하여 페이지 로딩을 방해하지 않도록 함
  }
}

// 매물 상세 보기 표시
const showPropertyDetail = (property) => {
  try {
    selectedProperty.value = property
    showDetail.value = true
    // URL 업데이트 - buildingId 사용
    const buildingId = property.buildingId || getBuildingIdByName(property.buildingName)
    if (buildingId) {
      router.push(`/map/apt/${buildingId}`)
    } else {
      console.warn('매물에 대한 buildingId를 찾을 수 없습니다:', property.buildingName)
    }
  } catch (error) {
    console.error('매물 상세 보기 표시 실패:', error)
  }
}

// 상세 보기 닫기
const closePropertyDetail = () => {
  try {
    showDetail.value = false
    selectedProperty.value = null
    // URL을 기본 맵 페이지로 변경
    router.push('/map')
  } catch (error) {
    console.error('상세 보기 닫기 실패:', error)
  }
}

// 채팅 페이지로 이동
const goToChat = () => {
  router.push('/chat/list')
}

// 리뷰 목록 페이지로 이동
const goToReviewList = () => {
  if (selectedProperty.value) {
    const buildingId = getBuildingIdByName(selectedProperty.value.buildingName)
    if (buildingId) {
      router.push(`/review/${buildingId}`)
    } else {
      console.warn(
        '매물에 대한 buildingId를 찾을 수 없습니다:',
        selectedProperty.value.buildingName
      )
    }
  }
}

// 필터 변경 감지
watch(
  () => mapStore.filteredProperties,
  (newProperties) => {
    displayMarkers(newProperties)
  },
  { deep: true }
)

onMounted(() => {
  initializeKakaoMap()

  // buildingId가 있으면 매물 상세 정보 가져오기
  if (props.buildingId) {
    try {
      // buildingId로 매물 찾기
      const property = sampleProperties.find((p) => p.buildingId === parseInt(props.buildingId))
      if (property) {
        showPropertyDetail(property)
      } else {
        console.warn('buildingId에 해당하는 매물을 찾을 수 없습니다:', props.buildingId)
      }
    } catch (error) {
      console.error('매물 상세 정보 가져오기 실패:', error)
    }
  }
})
</script>

<template>
  <div class="map-container">
    <div class="main-content">
      <!-- 좌측 사이드바 (기본 필터 사이드바) -->
      <div class="sidebar" v-if="!showDetail">
        <!-- 검색바 (사이드바 상단으로 이동) -->
        <div class="search-section">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="지역, 지하철, 아파트명 등으로 검색"
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>

        <!-- 매물 유형 -->
        <div class="filter-section">
          <h3 class="filter-title">매물 유형</h3>
          <div class="filter-options">
            <button
              class="filter-button"
              :class="{ active: mapStore.filters.propertyTypes.apartment }"
              @click="togglePropertyType('apartment')"
            >
              아파트
            </button>
            <button
              class="filter-button"
              :class="{ active: mapStore.filters.propertyTypes.officetel }"
              @click="togglePropertyType('officetel')"
            >
              오피스텔
            </button>
            <button
              class="filter-button"
              :class="{ active: mapStore.filters.propertyTypes.house }"
              @click="togglePropertyType('house')"
            >
              주택
            </button>
            <button
              class="filter-button"
              :class="{ active: mapStore.filters.propertyTypes.villa }"
              @click="togglePropertyType('villa')"
            >
              빌라
            </button>
          </div>
        </div>

        <!-- 거래 유형 -->
        <div class="filter-section">
          <h3 class="filter-title">거래 유형</h3>
          <div class="filter-options">
            <button
              class="filter-button"
              :class="{ active: mapStore.filters.transactionTypes.sale }"
              @click="toggleTransactionType('sale')"
            >
              매매
            </button>
            <button
              class="filter-button"
              :class="{ active: mapStore.filters.transactionTypes.lease }"
              @click="toggleTransactionType('lease')"
            >
              전세
            </button>
            <button
              class="filter-button"
              :class="{ active: mapStore.filters.transactionTypes.rent }"
              @click="toggleTransactionType('rent')"
            >
              월세
            </button>
          </div>
        </div>

        <!-- 시세 범위 -->
        <div class="filter-section">
          <h3 class="filter-title">시세 범위</h3>
          <div class="price-range">
            <div class="price-inputs">
              <!-- 최소값 조작 -->
              <button
                class="price-btn"
                @click="decreaseMinPrice"
                :disabled="mapStore.filters.priceRange.min <= 0"
                title="최소값 감소"
              >
                -
              </button>
              <div class="price-input-container">
                <input
                  type="number"
                  v-model="mapStore.filters.priceRange.min"
                  min="0"
                  max="50"
                  class="price-input"
                  @change="validatePriceRange"
                  @input="validatePriceRange"
                  @wheel.prevent
                  placeholder="0"
                />
                <span class="price-unit">억</span>
              </div>
              <button
                class="price-btn"
                @click="increaseMinPrice"
                :disabled="mapStore.filters.priceRange.min >= mapStore.filters.priceRange.max"
                title="최소값 증가"
              >
                +
              </button>

              <!-- 구분자 -->
              <span class="price-separator">~</span>

              <!-- 최대값 조작 -->
              <button
                class="price-btn"
                @click="decreaseMaxPrice"
                :disabled="mapStore.filters.priceRange.max <= mapStore.filters.priceRange.min"
                title="최대값 감소"
              >
                -
              </button>
              <div class="price-input-container">
                <input
                  type="number"
                  v-model="mapStore.filters.priceRange.max"
                  min="0"
                  max="50"
                  class="price-input"
                  @change="validatePriceRange"
                  @input="validatePriceRange"
                  @wheel.prevent
                  placeholder="50"
                />
                <span class="price-unit">억</span>
              </div>
              <button
                class="price-btn"
                @click="increaseMaxPrice"
                :disabled="mapStore.filters.priceRange.max >= 50"
                title="최대값 증가"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- 필터 적용 버튼 -->
        <button @click="applyFilters" class="apply-filter-btn">필터 적용</button>

        <!-- 초기화 버튼 -->
        <button @click="resetFilters" class="reset-filter-btn">초기화</button>
      </div>

      <!-- 매물 상세 보기 사이드바 (왼쪽에 표시) -->
      <div class="detail-sidebar-left" v-if="showDetail && selectedProperty">
        <!-- 헤더 (고정) -->
        <div class="detail-header">
          <button class="back-btn" @click="closePropertyDetail">
            <span class="back-icon">←</span>
          </button>
          <h2 class="detail-title">
            {{ selectedProperty.resComplexName || selectedProperty.buildingName }}
          </h2>
          <div class="header-actions">
            <button
              class="action-btn"
              :title="selectedProperty.isBookmarked ? '찜하기 취소' : '찜하기'"
              :class="{ bookmarked: selectedProperty.isBookmarked }"
            >
              <i :class="selectedProperty.isBookmarked ? 'fas fa-heart' : 'far fa-heart'"></i>
            </button>
            <button
              class="action-btn"
              :title="selectedProperty.isNotification ? '알림 해제' : '알림 설정'"
              :class="{ notified: selectedProperty.isNotification }"
            >
              <i :class="selectedProperty.isNotification ? 'fas fa-bell' : 'far fa-bell'"></i>
            </button>
          </div>
        </div>

        <!-- 스크롤 가능한 콘텐츠 영역 -->
        <div class="detail-content">
          <!-- 매물 정보 섹션 -->
          <div class="detail-section">
            <h3 class="section-title">
              <span class="section-icon">🏠</span>
              매물 정보
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">등록자 유형</span>
                <span class="info-value">집주인</span>
              </div>
              <div class="info-item">
                <span class="info-label">매매 종류</span>
                <span class="info-value">{{
                  selectedProperty.resType || selectedProperty.saleType
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">부동산 종류</span>
                <span class="info-value">{{
                  selectedProperty.resRealty || selectedProperty.propertyType
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">면적</span>
                <span class="info-value">{{
                  selectedProperty.resAreaPriceList?.[0]?.resArea || '84.5㎡'
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">도로명 주소</span>
                <span class="info-value">{{
                  selectedProperty.commAddrRoadName || selectedProperty.address
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">층수</span>
                <span class="info-value">지하 3층 ~ 지상 25층</span>
              </div>
              <div class="info-item">
                <span class="info-label">상세 주소</span>
                <span class="info-value">101동 1001호</span>
              </div>
              <div class="info-item">
                <span class="info-label">난방</span>
                <span class="info-value">지역난방</span>
              </div>
              <div class="info-item">
                <span class="info-label">준공일자</span>
                <span class="info-value">2019년 12월</span>
              </div>
              <div class="info-item">
                <span class="info-label">세대수</span>
                <span class="info-value">{{
                  selectedProperty.resCompositionCnt || '1200세대'
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">준공일자</span>
                <span class="info-value">{{
                  selectedProperty.resApprovalDate || '2019년 12월'
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">난방</span>
                <span class="info-value">{{
                  selectedProperty.resHeatingSystem || '지역난방'
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">시설</span>
                <span class="info-value">{{
                  selectedProperty.resFacility || '엘리베이터, 주차장'
                }}</span>
              </div>
            </div>
          </div>

          <!-- 시세 그래프 섹션 -->
          <div class="detail-section">
            <h3 class="section-title">
              <span class="section-icon">📈</span>
              시세 그래프
            </h3>
            <div class="graph-controls">
              <select class="graph-select">
                <option>매매</option>
              </select>
              <select class="graph-select">
                <option>전월세</option>
              </select>
              <select class="graph-select">
                <option>32평</option>
              </select>
              <select class="graph-select">
                <option>최근 3년</option>
              </select>
            </div>
            <div class="graph-placeholder">
              <div class="graph-area">
                <div class="graph-line"></div>
                <div class="graph-labels">
                  <span>01</span>
                  <span>03</span>
                  <span>06</span>
                  <span>09</span>
                  <span>12</span>
                  <span>15</span>
                  <span>18</span>
                </div>
              </div>
              <div class="price-info">
                <div class="current-price">
                  <span class="price-label"
                    >현재 {{ selectedProperty.resType || '매매' }} 시세</span
                  >
                  <span class="price-value">
                    {{
                      selectedProperty.resAreaPriceList?.[0]?.resLowerAveragePrice ||
                      generatePropertyInfo(selectedProperty)
                    }}
                  </span>
                </div>
                <div class="price-change">
                  <span class="change-label">전월 대비</span>
                  <span class="change-value positive">+0.4억</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 매물 설명 섹션 -->
          <div class="detail-section">
            <h3 class="section-title">매물 설명</h3>
            <div class="description-content">
              <div class="desc-item">
                <h4 class="desc-title">한 줄 소개</h4>
                <p class="desc-text">
                  {{ selectedProperty.infoOneline || '한 줄 소개가 없습니다.' }}
                </p>
              </div>
              <div class="desc-item">
                <h4 class="desc-title">매물 제목</h4>
                <p class="desc-text">
                  {{ selectedProperty.title || '제목이 없습니다.' }}
                </p>
              </div>
              <div class="desc-item">
                <h4 class="desc-title">매물 설명</h4>
                <p class="desc-text">
                  {{ selectedProperty.infoBuilding || '상세 설명이 없습니다.' }}
                </p>
              </div>
              <div class="desc-item">
                <h4 class="desc-title">매물 사진</h4>
                <p class="desc-text">
                  {{ selectedProperty.imageUrl ? '사진이 있습니다.' : '사진이 없습니다.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- 담당자 정보 섹션 -->
          <div class="detail-section">
            <h3 class="section-title agent-title">담당자 정보</h3>
            <div class="agent-info">
              <div class="agent-item">
                <span class="agent-label">담당자 이름</span>
                <span class="agent-value">{{ selectedProperty.contactName || '김철수' }}</span>
              </div>
              <div class="agent-item">
                <span class="agent-label">연락처</span>
                <span class="agent-value">{{
                  selectedProperty.contactPhone || selectedProperty.resTelNo || '010-1234-5678'
                }}</span>
              </div>
            </div>
          </div>

          <!-- 거주자 리뷰 섹션 -->
          <div class="detail-section">
            <div class="review-header">
              <h3 class="section-title">
                <span class="star-icon">☆</span>
                거주자 리뷰
              </h3>
              <button class="more-btn" @click="goToReviewList">→</button>
            </div>
            <div class="review-list">
              <div
                v-if="selectedProperty.review && selectedProperty.review.length > 0"
                v-for="review in selectedProperty.review.slice(0, 3)"
                :key="review.reviewId"
                class="review-item"
              >
                <div class="review-header-info">
                  <span class="reviewer-name">{{ review.reviewerNickname }}</span>
                  <div class="star-rating">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="star"
                      :class="{ filled: i <= parseFloat(review.rank) }"
                      >★</span
                    >
                  </div>
                </div>
                <p class="review-text">{{ review.content }}</p>
                <div class="review-footer">
                  <span class="helpful-count">도움됨 12</span>
                  <span class="review-date">{{ review.createdAt }}</span>
                </div>
              </div>
              <div v-else class="review-item">
                <p class="review-text">아직 리뷰가 없습니다.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 액션 버튼 섹션 (고정) -->
        <div class="action-buttons-section">
          <div class="action-buttons">
            <div class="download-buttons-row">
              <button class="action-btn-download">
                <span class="btn-icon">▼</span>
                <span class="btn-text">등기부등본</span>
              </button>
              <button class="action-btn-download">
                <span class="btn-icon">▼</span>
                <span class="btn-text">건축물대장</span>
              </button>
              <button class="action-btn-download">
                <span class="btn-icon">▼</span>
                <span class="btn-text">분석 리포트</span>
              </button>
            </div>
            <button class="action-btn-chat" @click="goToChat">
              <span class="btn-icon">💬</span>
              <span class="btn-text">임대인과 채팅하기</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 지도 영역 -->
      <div class="map-area">
        <div ref="mapContainer" class="map-canvas"></div>

        <!-- 우측 컨트롤 버튼들 -->
        <div class="map-controls">
          <button class="control-btn" title="버스/지하철">🚌</button>
          <button class="control-btn" title="병원">🏥</button>
          <button class="control-btn" title="편의점/마트">🛒</button>
          <button class="control-btn" title="숨김">❌</button>
        </div>

        <!-- 우측 하단 집 내놓기 버튼 -->
        <div class="floating-action">
          <button class="floating-btn" title="집 내놓기" @click="goToUpload">
            <span class="house-icon">🏠</span>
            <span class="btn-text">집 내놓기</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: calc(100vh - 97px); /* 헤더 높이만큼 뺀 높이 */
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-section {
  margin-bottom: 20px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #666;
  font-size: 16px;
  z-index: 1;
  top: 50%;
  transform: translateY(-50%);
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #f9f9f9;
}

.search-input:focus {
  border-color: #4caf50;
  background: white;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 420px;
  background: #f8f9fa;
  padding: 20px;
  overflow-y: auto;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 97px); /* 헤더 높이만큼 뺀 높이 */
}

.filter-section {
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #2e7d32;
}

.filter-options {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: space-between;
}

.filter-button {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  min-width: 70px;
  text-align: center;
  flex: 1;
}

.filter-button:hover {
  border-color: #4caf50;
  color: #4caf50;
}

.filter-button.active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.price-range {
  margin-top: 8px;
  width: 100%;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
}

.price-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.price-btn:hover:not(:disabled) {
  border-color: #4caf50;
  color: #4caf50;
  background: #e8f5e8;
}

.price-btn:disabled {
  background: #f0f0f0;
  color: #ccc;
  cursor: not-allowed;
  border-color: #e0e0e0;
}

.price-input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  flex-shrink: 0;
  padding: 0 2px;
}

.price-input {
  width: 40px;
  padding: 4px 6px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  background: transparent;
  outline: none;
  /* Remove spinner arrows */
  -webkit-appearance: none;
  -moz-appearance: textfield;
  appearance: none;
}

/* Remove spinner arrows for all browsers */
.price-input::-webkit-outer-spin-button,
.price-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.price-input[type='number'] {
  -moz-appearance: textfield;
}

.price-input:focus {
  outline: none;
}

.price-input-container:focus-within {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.price-unit {
  font-size: 13px;
  color: #666;
  margin: 0 2px;
  flex-shrink: 0;
}

.price-separator {
  font-size: 13px;
  color: #666;
  margin: 0 4px;
  flex-shrink: 0;
}

.apply-filter-btn,
.reset-filter-btn {
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-filter-btn {
  background: #4caf50;
  color: white;
}

.apply-filter-btn:hover {
  background: #45a049;
}

.reset-filter-btn {
  background: #f0f0f0;
  color: #666;
}

.reset-filter-btn:hover {
  background: #e0e0e0;
}

.map-area {
  flex: 1;
  position: relative;
}

.map-canvas {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.control-btn {
  width: 48px;
  height: 48px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.control-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.floating-action {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.floating-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  padding: 8px;
}

.floating-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.house-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.btn-text {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
}

/* 매물 상세 보기 사이드바 (왼쪽) */
.detail-sidebar-left {
  width: 420px;
  background: white;
  padding: 0;
  overflow: hidden;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);

  position: relative;
  z-index: 1000;

  height: calc(100vh - 97px); /* 헤더 높이만큼 뺀 높이 */
  display: flex;
  flex-direction: column;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

/* detail-content 스크롤바 스타일링 */
.detail-content::-webkit-scrollbar {
  width: 8px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.detail-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  margin-right: 12px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #e9ecef;
}

.detail-title {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.action-btn:hover {
  background: #e9ecef;
}

.action-btn.bookmarked {
  color: #e74c3c;
}

.action-btn.notified {
  color: #f39c12;
}

.detail-section {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-icon {
  margin-right: 8px;
  font-size: 18px;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 400;
}

.graph-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.graph-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

.graph-placeholder {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.graph-area {
  height: 120px;
  background: white;
  border-radius: 4px;
  margin-bottom: 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.graph-line {
  width: 80%;
  height: 2px;
  background: #4caf50;
  position: relative;
}

.graph-line::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 0;
  width: 100%;
  height: 10px;
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
  border-radius: 5px;
}

.graph-labels {
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.price-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.price-change {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.change-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.change-value {
  font-size: 14px;
  font-weight: bold;
}

.change-value.positive {
  color: #4caf50;
}

.description-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.desc-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.desc-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.desc-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* 담당자 정보 스타일 */
.agent-title {
  color: #4caf50 !important;
}

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.agent-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.agent-value {
  font-size: 14px;
  color: #333;
  font-weight: 400;
}

/* 거주자 리뷰 스타일 */
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.star-icon {
  color: #ffc107;
  margin-right: 8px;
  font-size: 18px;
}

.more-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;
}

.more-btn:hover {
  color: #4caf50;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.review-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.star-rating {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 14px;
  color: #ddd;
}

.star.filled {
  color: #ffc107;
}

.review-text {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin: 0 0 8px 0;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.helpful-count {
  color: #4caf50;
  font-weight: 500;
}

/* 액션 버튼 스타일 */
.action-buttons-section {
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.download-buttons-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.action-btn-download,
.action-btn-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-download {
  flex: 1;
  min-width: 0;
}

.action-btn-chat {
  width: 100%;
}

.action-btn-download {
  background: #007bff;
  color: white;
}

.action-btn-download:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.action-btn-chat {
  background: #4caf50;
  color: white;
}

.action-btn-chat:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    max-height: 300px;
  }

  .detail-sidebar-left {
    width: 100%;
    height: calc(100vh - 97px); /* 헤더 높이만큼 뺀 높이 */
    position: relative;
    z-index: 1000;
  }

  .filter-options {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .filter-button {
    flex: none;
    min-width: 80px;
  }

  .map-area {
    height: calc(100vh - 400px); /* 헤더 + 사이드바 높이만큼 뺀 높이 */
  }
}

@media (max-width: 1200px) {
  .sidebar {
    width: 380px;
  }

  .detail-sidebar-left {
    width: 380px;
  }
}
</style>
