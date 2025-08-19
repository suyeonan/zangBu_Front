<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePropertyStore } from '@/stores/property/property'
import { useAuthStore } from '@/stores/auth/auth'
import PropertyBasicInfoForm from '@/components/property/PropertyBasicInfoForm.vue'
import PropertyDetailForm from '@/components/property/PropertyDetailForm.vue'
import PropertyContactForm from '@/components/property/PropertyContactForm.vue'

const router = useRouter()
const route = useRoute()
const propertyStore = usePropertyStore()
const authStore = useAuthStore()

// 고유 ID 생성 함수
const generateTransactionId = () => {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 현재 단계
const currentStep = ref(1)
const totalSteps = 4

// 매물 정보
const propertyData = ref(null)
const propertyId = ref(route.params.id || null)

// 로딩 상태
const isLoading = ref(true)

// 폼 데이터 (기존 매물 데이터로 자동 채워짐)
const formData = ref({
  // 등록자 유형
  registrantType: '', // 'owner' | 'tenant'

  // 매물 종류
  propertyType: '', // 'sale' | 'jeonse' | 'monthly'

  // 매매가/보증금
  price: '',
  deposit: '',

  // 주민등록번호
  identity: '',

  // 부동산 유형
  buildingType: '', // 'apartment' | 'officetel' | 'villa' | 'house'
  buildingName: '',

  // 면적
  area: '',

  // 입주 가능 날짜
  moveInType: '', // 'immediate' | 'date' | 'negotiable'
  moveInDate: '',

  // 매물 상세
  title: '',
  features: '',
  description: '',

  // 담당자 정보
  contactName: '',
  contactPhone: '',
})

// 숫자에 콤마 추가하는 함수
const formatNumber = (value) => {
  if (!value) return ''
  // 숫자가 아닌 문자 제거
  const numericValue = value.toString().replace(/[^\d]/g, '')
  // 천 단위마다 콤마 추가
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 콤마 제거하고 숫자만 반환하는 함수
const removeCommas = (value) => {
  if (!value) return ''
  return value.toString().replace(/,/g, '')
}

// 가격 유효성 검사
const priceError = computed(() => {
  if (!formData.value.price) return ''
  const price = parseInt(removeCommas(formData.value.price))
  if (price > 4000000000) {
    return '가격은 40억 원을 초과할 수 없습니다'
  }
  return ''
})

// 가격 포맷팅 처리
const handlePriceInput = (event) => {
  const value = event.target.value
  const numericValue = removeCommas(value)
  const formattedValue = formatNumber(numericValue)
  formData.value.price = formattedValue
  event.target.value = formattedValue
}

// 보증금 포맷팅 처리
const handleDepositInput = (event) => {
  const value = event.target.value
  const numericValue = removeCommas(value)
  const formattedValue = formatNumber(numericValue)
  formData.value.deposit = formattedValue
  event.target.value = formattedValue
}

// 주민등록번호 입력 처리
const handleIdentityInput = (event) => {
  const value = event.target.value.replace(/[^\d]/g, '') // 숫자만 허용
  let formattedValue = value

  // 주민등록번호 형식으로 포맷팅 (000000-0000000)
  if (value.length > 6) {
    formattedValue = value.slice(0, 6) + '-' + value.slice(6, 13)
  }

  formData.value.identity = formattedValue
  event.target.value = formattedValue
}

// 주민등록번호 유효성 검사
const identityError = computed(() => {
  if (!formData.value.identity) return ''

  const identity = formData.value.identity.replace(/[^\d]/g, '')
  if (identity.length !== 13) {
    return '주민등록번호는 13자리여야 합니다'
  }

  // 생년월일 유효성 검사
  const year = parseInt(identity.slice(0, 2))
  const month = parseInt(identity.slice(2, 4))
  const day = parseInt(identity.slice(4, 6))

  if (month < 1 || month > 12) {
    return '올바른 월을 입력해주세요'
  }

  if (day < 1 || day > 31) {
    return '올바른 일을 입력해주세요'
  }

  return ''
})

// 매물 상세 데이터 API 호출 및 폼에 매핑
const loadPropertyData = async () => {
  // buildingId가 있으면 API 호출, 없으면 라우터 데이터 사용
  const buildingId = propertyId.value || propertyData.value?.buildingId

  if (!buildingId) {
    console.error('buildingId가 없습니다!')
    alert('매물 정보가 없습니다.')
    router.push('/user/mypage?tab=my')
    return
  }

  try {
    isLoading.value = true

    // 내가 등록한 매물 목록에서 해당 buildingId 찾기
    const result = await propertyStore.fetchMyProperties()

    if (!result.success || !result.data || !result.data.buildings) {
      throw new Error('내 매물 목록을 불러올 수 없습니다.')
    }

    // buildings 배열에서 해당 buildingId 찾기
    const apiData = result.data.buildings.find(
      (property) => property.buildingId === parseInt(buildingId)
    )

    if (!apiData) {
      throw new Error('해당 매물을 찾을 수 없습니다.')
    }

    // API 데이터가 있으면 사용, 없으면 라우터 데이터 사용
    const data = apiData || propertyData.value

    if (data) {
      // API 응답 데이터를 폼에 자동으로 매핑
      formData.value = {
        registrantType: data.sellerType === 'OWNER' ? 'owner' : 'tenant',
        propertyType:
          data.saleType === 'TRADING'
            ? 'sale'
            : data.saleType === 'JEONSE'
            ? 'jeonse'
            : data.saleType === 'MONTHLY'
            ? 'monthly'
            : 'sale',
        price: formatNumber(data.price?.toString() || ''),
        deposit: formatNumber(data.deposit?.toString() || ''),
        identity: '',
        buildingType: data.propertyType?.toLowerCase() || 'apartment',
        buildingName: data.buildingName || '',
        area: data.size?.toString() || '',
        moveInType: 'date',
        moveInDate: data.moveDate ? new Date(data.moveDate).toISOString().split('T')[0] : '',
        title: data.infoOneline || '',
        features: data.facility || '',
        description: data.infoBuilding || '',
        contactName: data.contactName || '',
        contactPhone: data.contactPhone || '',
      }

      // API에서 가져온 데이터를 propertyData에 저장
      propertyData.value = data
    }

    isLoading.value = false
  } catch (error) {
    console.error('매물 데이터 로딩 실패:', error)
    alert('매물 정보를 불러오는데 실패했습니다.')
    router.push('/user/mypage?tab=my')
    isLoading.value = false
  }
}

// 폼 제출 (매물 수정)
const handleSubmit = async () => {
  if (priceError.value) {
    alert('가격을 확인해주세요.')
    return
  }

  // 최소한의 필수 필드만으로 먼저 테스트
  const minimalData = {
    buildingId: propertyData.value.buildingId,
    sellerNickname: propertyData.value.sellerNickname,
    saleType: propertyData.value.saleType,
    price: propertyData.value.price,
    deposit: propertyData.value.deposit,
    bookmarkCount: propertyData.value.bookmarkCount,
    createdAt: propertyData.value.createdAt,
    buildingName: propertyData.value.buildingName,
    sellerType: propertyData.value.sellerType,
    propertyType: propertyData.value.propertyType,
    moveDate: propertyData.value.moveDate,
    infoOneline: propertyData.value.infoOneline,
    infoBuilding: propertyData.value.infoBuilding,
    contactName: propertyData.value.contactName,
    contactPhone: propertyData.value.contactPhone,
    facility: propertyData.value.facility,
    size: propertyData.value.size,
  }

  // /building/update API로 전송할 데이터 형식 (백엔드 DTO에 맞춤)
  const updateData = {
    buildingId: propertyData.value.buildingId, // 원본 그대로
    sellerNickname: formData.value.contactName || propertyData.value.sellerNickname,
    saleType:
      formData.value.propertyType === 'sale'
        ? 'TRADING'
        : formData.value.propertyType === 'jeonse'
        ? 'CHARTER'
        : 'MONTHLY',
    price: parseInt(removeCommas(formData.value.price)) || propertyData.value.price,
    deposit: parseInt(removeCommas(formData.value.deposit)) || propertyData.value.deposit,
    bookmarkCount: propertyData.value.bookmarkCount,
    createdAt: propertyData.value.createdAt.replace(' ', 'T'), // LocalDateTime 형식으로 변환
    buildingName: formData.value.buildingName || propertyData.value.buildingName,
    sellerType: formData.value.registrantType === 'owner' ? 'OWNER' : 'TENANT',
    propertyType: propertyData.value.propertyType, // 원본 그대로
    moveDate: formData.value.moveInDate
      ? formData.value.moveInDate + 'T00:00:00'
      : propertyData.value.moveDate.replace(' ', 'T'), // LocalDateTime 형식으로 변환
    infoOneline: formData.value.title || propertyData.value.infoOneline,
    infoBuilding: formData.value.description || propertyData.value.infoBuilding,
    contactName: formData.value.contactName || propertyData.value.contactName,
    contactPhone: formData.value.contactPhone || propertyData.value.contactPhone,
    facility: formData.value.features || propertyData.value.facility,
    size: parseFloat(formData.value.area) || propertyData.value.size,
  }

  try {
    // /building/update API 직접 호출 (PATCH)
    const { updateProperty } = await import('@/api/property/property')
    const result = await updateProperty(updateData)

    // 성공 팝업창 표시
    showSuccessModal.value = true
    successMessage.value = '매물 수정이 성공했습니다!'

    // 2초 후 마이페이지의 내가 등록한 매물 탭으로 리다이렉트
    setTimeout(() => {
      showSuccessModal.value = false
      router.push('/user/mypage?tab=my')
    }, 2000)
  } catch (error) {
    console.error('매물 수정 실패:', error)
    alert(error.response?.data?.message || '매물 수정에 실패했습니다.')
  }
}

// 각 단계별 필수 필드 검증
const validateStep = (step) => {
  const missingFields = []

  if (step === 1) {
    // 1단계: 매물 기본 정보
    if (!formData.value.registrantType) missingFields.push('등록자 유형')
    if (!formData.value.propertyType) missingFields.push('매물 종류')

    // 매물 종류에 따른 가격 필드 검증
    if (formData.value.propertyType === 'sale') {
      if (!formData.value.price) missingFields.push('매매가')
    } else if (formData.value.propertyType === 'jeonse') {
      if (!formData.value.price) missingFields.push('전세금')
    } else if (formData.value.propertyType === 'monthly') {
      if (!formData.value.deposit) missingFields.push('보증금')
      if (!formData.value.price) missingFields.push('월세')
    }

    if (!formData.value.buildingType) missingFields.push('부동산 유형')
    if (!formData.value.area) missingFields.push('전용 면적')
    if (!formData.value.moveInType) missingFields.push('입주 가능 날짜')
  } else if (step === 2) {
    // 2단계: 매물 상세 설명
    if (!formData.value.title) missingFields.push('매물 제목')
    if (!formData.value.description) {
      missingFields.push('매물 설명')
    } else if (formData.value.description.length < 50) {
      missingFields.push('매물 설명 (최소 50자)')
    }
  } else if (step === 3) {
    // 3단계: 담당자 정보
    if (!formData.value.contactName) missingFields.push('담당자 이름')
    if (!formData.value.contactPhone) missingFields.push('연락처')
  }

  return missingFields
}

// 모달 상태
const showValidationModal = ref(false)
const validationMessage = ref('')
const showSuccessModal = ref(false)
const successMessage = ref('')

// 다음 단계로 이동
const nextStep = () => {
  const missingFields = validateStep(currentStep.value)

  if (missingFields.length > 0) {
    validationMessage.value = `다음 필드를 입력해주세요:\n• ${missingFields.join('\n• ')}`
    showValidationModal.value = true
    return
  }

  if (currentStep.value < totalSteps) {
    currentStep.value++
    // Header 컴포넌트 바로 아래로 스크롤
    setTimeout(() => {
      const headerComponent = document.querySelector('header')
      if (headerComponent) {
        const headerBottom = headerComponent.offsetTop + headerComponent.offsetHeight
        window.scrollTo({
          top: headerBottom,
          behavior: 'smooth',
        })
      }
    }, 100)
  }
}

// 모달 닫기
const closeValidationModal = () => {
  showValidationModal.value = false
  validationMessage.value = ''
}

// 성공 모달 닫기
const closeSuccessModal = () => {
  showSuccessModal.value = false
  successMessage.value = ''
}

// 이미지 URL 생성 함수
const getImageUrl = (image) => {
  if (typeof image === 'string') {
    return image
  }
  return URL.createObjectURL(image)
}

// 이미지 모달 상태
const showImageModal = ref(false)
const selectedImage = ref(null)
const selectedImageIndex = ref(0)

// 이미지 모달 열기
const openImageModal = (image, index) => {
  selectedImage.value = image
  selectedImageIndex.value = index
  showImageModal.value = true
}

// 이미지 모달 닫기
const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = null
  selectedImageIndex.value = 0
}

// 이전/다음 이미지 보기
const showPrevImage = () => {
  if (selectedImageIndex.value > 0) {
    selectedImageIndex.value--
    selectedImage.value = formData.value.images[selectedImageIndex.value]
  }
}

const showNextImage = () => {
  if (selectedImageIndex.value < formData.value.images.length - 1) {
    selectedImageIndex.value++
    selectedImage.value = formData.value.images[selectedImageIndex.value]
  }
}

// 이전 단계로 이동
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    // Header 컴포넌트 바로 아래로 스크롤
    setTimeout(() => {
      const headerComponent = document.querySelector('header')
      if (headerComponent) {
        const headerBottom = headerComponent.offsetTop + headerComponent.offsetHeight
        window.scrollTo({
          top: headerBottom,
          behavior: 'smooth',
        })
      }
    }, 100)
  }
}

// 현재 단계의 제목과 설명
const stepInfo = computed(() => {
  const steps = {
    1: { title: '매물 기본 정보', description: '필수 정보를 수정해주세요.' },
    2: { title: '매물 상세 설명', description: '상세 정보를 수정해주세요.' },
    3: { title: '담당자 정보', description: '연락 가능한 정보를 수정해주세요.' },
    4: { title: '매물 수정', description: '수정된 정보를 확인하고 저장해주세요.' },
  }
  return steps[currentStep.value]
})

// 취소
const handleCancel = () => {
  if (confirm('매물 수정을 취소하시겠습니까?')) {
    // 마이페이지로 이동
    router.push('/user/mypage?tab=registered')
  }
}

// 컴포넌트 마운트 시 매물 데이터 로드
onMounted(() => {
  loadPropertyData()
})
</script>

<template>
  <div class="min-h-screen" style="background: var(--bg-1)">
    <!-- 로딩 화면 -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-3 mx-auto mb-4"
        ></div>
        <p class="text-text-1">매물 정보를 불러오는 중...</p>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div v-else class="min-h-screen">
      <!-- 뒤로가기 버튼 -->
      <div class="fixed top-20 lg:top-24 left-4 z-50">
        <button
          @click="$router.go(-1)"
          class="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
      </div>

      <div class="flex items-center justify-center p-4 lg:p-12 min-h-screen">
        <div class="w-full max-w-4xl">
          <!-- 통합 헤더 & 매물 수정 폼 -->
          <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <!-- 헤더 섹션 -->
            <div
              class="p-4 lg:p-8"
              style="background: var(--bg-2); border-bottom: 1px solid #e5e7eb"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                    <div
                      class="w-1.5 h-6 lg:w-2 lg:h-8 rounded-full"
                      style="background: var(--brand-3)"
                    ></div>
                    <span
                      class="px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-xs lg:text-sm font-semibold"
                      style="background: var(--brand-3); color: var(--text-3)"
                      >매물 수정</span
                    >
                  </div>
                  <h1
                    class="text-xl lg:text-3xl font-bold mb-2 lg:mb-3"
                    style="color: var(--text-2)"
                  >
                    {{ stepInfo.title }}
                  </h1>
                  <p class="text-xs lg:text-base mb-2 leading-relaxed" style="color: var(--text-1)">
                    {{ stepInfo.description }}
                  </p>
                </div>
                <div class="hidden lg:block">
                  <div
                    class="w-12 lg:w-16 h-12 lg:h-16 rounded-full flex items-center justify-center"
                    style="background: var(--brand-3)"
                  >
                    <svg
                      class="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style="color: var(--text-3)"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- 콘텐츠 섹션 -->
            <div class="p-4 lg:p-12">
              <!-- 단계 표시기 -->
              <div class="mb-8 lg:mb-12">
                <div class="flex justify-between px-4">
                  <div v-for="step in totalSteps" :key="step" class="flex flex-col items-center">
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200"
                      :class="
                        step <= currentStep ? 'bg-brand-3 text-white' : 'bg-gray-200 text-gray-500'
                      "
                    >
                      {{ step }}
                    </div>
                    <span class="text-xs mt-1 text-gray-600">
                      {{
                        step === 1
                          ? '기본정보'
                          : step === 2
                          ? '상세정보'
                          : step === 3
                          ? '담당자'
                          : '확인'
                      }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 매물 수정 폼 -->
              <form @submit.prevent="handleSubmit" class="space-y-12 lg:space-y-16">
                <!-- 1. 매물 기본 정보 -->
                <div v-if="currentStep === 1">
                  <PropertyBasicInfoForm
                    :is-edit-mode="true"
                    :model-value="formData"
                    @update:model-value="(value) => Object.assign(formData, value)"
                  />
                </div>

                <!-- 2. 매물 상세 설명 -->
                <div v-if="currentStep === 2">
                  <PropertyDetailForm
                    :is-edit-mode="true"
                    :model-value="formData"
                    @update:model-value="(value) => Object.assign(formData, value)"
                  />
                </div>

                <!-- 3. 담당자 정보 -->
                <div v-if="currentStep === 3">
                  <PropertyContactForm
                    :model-value="formData"
                    @update:model-value="(value) => Object.assign(formData, value)"
                  />
                </div>

                <!-- 4. 매물 수정 확인 -->
                <div v-if="currentStep === 4">
                  <div class="space-y-8">
                    <!-- 기본 정보 요약 -->
                    <div class="bg-gray-50 rounded-lg p-6">
                      <h4 class="font-semibold text-text-2 mb-4">매물 기본 정보</h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span class="text-text-1">등록자:</span>
                          {{ formData.registrantType === 'owner' ? '집주인' : '세입자' }}
                        </div>
                        <div>
                          <span class="text-text-1">매물 종류:</span>
                          {{
                            formData.propertyType === 'sale'
                              ? '매매'
                              : formData.propertyType === 'jeonse'
                              ? '전세'
                              : '월세'
                          }}
                        </div>
                        <!-- 매물 종류에 따른 가격 정보 -->
                        <div v-if="formData.propertyType === 'sale'">
                          <span class="text-text-1">매매가:</span>
                          {{ formData.price ? formData.price + '원' : '미입력' }}
                        </div>
                        <div v-else-if="formData.propertyType === 'jeonse'">
                          <span class="text-text-1">전세금:</span>
                          {{ formData.price ? formData.price + '원' : '미입력' }}
                        </div>
                        <div v-else-if="formData.propertyType === 'monthly'">
                          <div>
                            <span class="text-text-1">보증금:</span>
                            {{ formData.deposit ? formData.deposit + '원' : '미입력' }}
                          </div>
                          <div class="mt-1">
                            <span class="text-text-1">월세:</span>
                            {{ formData.price ? formData.price + '원' : '미입력' }}
                          </div>
                        </div>
                        <div>
                          <span class="text-text-1">부동산 유형:</span>
                          {{
                            formData.buildingType === 'apartment'
                              ? '아파트'
                              : formData.buildingType === 'officetel'
                              ? '오피스텔'
                              : formData.buildingType === 'villa'
                              ? '연립'
                              : '주택'
                          }}
                        </div>

                        <div>
                          <span class="text-text-1">면적:</span>
                          {{ formData.area ? formData.area + '㎡' : '미입력' }}
                        </div>
                      </div>
                    </div>

                    <!-- 상세 정보 요약 -->
                    <div class="bg-gray-50 rounded-lg p-6">
                      <h4 class="font-semibold text-text-2 mb-4">매물 상세 정보</h4>
                      <div class="space-y-3 text-sm">
                        <div>
                          <span class="text-text-1">제목:</span> {{ formData.title || '미입력' }}
                        </div>
                        <div>
                          <span class="text-text-1">특징:</span> {{ formData.features || '미입력' }}
                        </div>
                        <div>
                          <span class="text-text-1">설명:</span>
                          {{
                            formData.description
                              ? formData.description.length > 50
                                ? formData.description.substring(0, 50) + '...'
                                : formData.description
                              : '미입력'
                          }}
                        </div>
                      </div>
                    </div>

                    <!-- 담당자 정보 요약 -->
                    <div class="bg-gray-50 rounded-lg p-6">
                      <h4 class="font-semibold text-text-2 mb-4">담당자 정보</h4>
                      <div class="space-y-2 text-sm">
                        <div>
                          <span class="text-text-1">이름:</span>
                          {{ formData.contactName || '미입력' }}
                        </div>
                        <div>
                          <span class="text-text-1">연락처:</span>
                          {{ formData.contactPhone || '미입력' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 액션 버튼 -->
                <div
                  class="rounded-xl p-4 lg:p-12 border border-gray-200"
                  style="background: var(--bg-1)"
                >
                  <div class="text-center">
                    <div
                      class="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center"
                    >
                      <!-- 이전 버튼 (1단계가 아닐 때만 표시) -->
                      <button
                        v-if="currentStep > 1"
                        type="button"
                        @click="prevStep"
                        class="w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-all duration-200 text-base lg:text-lg whitespace-nowrap"
                        style="
                          background: var(--bg-1);
                          border: 1px solid var(--text-1);
                          color: var(--text-2);
                        "
                        @mouseenter="$event.target.style.background = 'var(--bg-2)'"
                        @mouseleave="$event.target.style.background = 'var(--bg-1)'"
                      >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 19l-7-7 7-7"
                          ></path>
                        </svg>
                        이전
                      </button>

                      <!-- 취소 버튼 -->
                      <button
                        type="button"
                        @click="handleCancel"
                        class="w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-all duration-200 text-base lg:text-lg whitespace-nowrap"
                        style="
                          background: var(--bg-1);
                          border: 1px solid var(--text-1);
                          color: var(--text-2);
                        "
                        @mouseenter="$event.target.style.background = 'var(--bg-2)'"
                        @mouseleave="$event.target.style.background = 'var(--bg-1)'"
                      >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                        취소
                      </button>

                      <!-- 다음/수정 버튼 -->
                      <button
                        v-if="currentStep < totalSteps"
                        type="button"
                        @click="nextStep"
                        class="w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-all duration-200 text-base lg:text-lg text-white shadow-lg hover:shadow-xl whitespace-nowrap"
                        style="background: var(--brand-3)"
                        @mouseenter="$event.target.style.background = 'var(--brand-2)'"
                        @mouseleave="$event.target.style.background = 'var(--brand-3)'"
                      >
                        다음
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      </button>

                      <button
                        v-else
                        type="submit"
                        class="w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-all duration-200 text-base lg:text-lg text-white shadow-lg hover:shadow-xl whitespace-nowrap"
                        style="background: var(--brand-3)"
                        @mouseenter="$event.target.style.background = 'var(--brand-2)'"
                        @mouseleave="$event.target.style.background = 'var(--brand-3)'"
                      >
                        매물 수정하기
                        <svg
                          class="w-5 h-5 lg:w-6 lg:h-6 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 필수 필드 검증 모달 -->
    <div
      v-if="showValidationModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <!-- 모달 헤더 -->
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 rounded-full bg-status-2 flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-text-2">필수 입력 항목 확인</h3>
          </div>

          <!-- 모달 내용 -->
          <div class="mb-6">
            <p class="text-text-1 whitespace-pre-line">{{ validationMessage }}</p>
          </div>

          <!-- 모달 버튼 -->
          <div class="flex justify-end">
            <button
              @click="closeValidationModal"
              class="px-6 py-2 bg-brand-3 text-white rounded-lg hover:bg-brand-2 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 성공 모달 -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <!-- 모달 헤더 -->
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 rounded-full bg-status-1 flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-text-2">매물 수정 완료</h3>
          </div>

          <!-- 모달 내용 -->
          <div class="mb-6">
            <p class="text-text-1 text-center">{{ successMessage }}</p>
            <p class="text-text-1 text-center text-sm mt-2">잠시 후 마이페이지로 이동합니다...</p>
          </div>

          <!-- 모달 버튼 -->
          <div class="flex justify-center">
            <button
              @click="closeSuccessModal"
              class="px-6 py-2 bg-brand-3 text-white rounded-lg hover:bg-brand-2 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 확대 모달 -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      @click="closeImageModal"
    >
      <div class="relative max-w-4xl max-h-full p-4" @click.stop>
        <!-- 모달 헤더 -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white text-lg font-medium">
            매물 사진 {{ selectedImageIndex + 1 }} / {{ formData.images.length }}
          </h3>
          <button @click="closeImageModal" class="text-white hover:text-gray-300 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- 이미지 -->
        <div class="relative">
          <img
            :src="getImageUrl(selectedImage)"
            :alt="`매물 사진 ${selectedImageIndex + 1}`"
            class="max-w-full max-h-[70vh] object-contain rounded-lg"
          />

          <!-- 이전 버튼 -->
          <button
            v-if="selectedImageIndex > 0"
            @click="showPrevImage"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>

          <!-- 다음 버튼 -->
          <button
            v-if="selectedImageIndex < formData.images.length - 1"
            @click="showNextImage"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </div>

        <!-- 썸네일 네비게이션 -->
        <div v-if="formData.images.length > 1" class="flex justify-center mt-4 space-x-2">
          <button
            v-for="(image, index) in formData.images"
            :key="index"
            @click="openImageModal(image, index)"
            :class="[
              'w-12 h-12 rounded border-2 overflow-hidden transition-all',
              index === selectedImageIndex
                ? 'border-brand-3'
                : 'border-gray-400 hover:border-white',
            ]"
          >
            <img
              :src="getImageUrl(image)"
              :alt="`썸네일 ${index + 1}`"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
