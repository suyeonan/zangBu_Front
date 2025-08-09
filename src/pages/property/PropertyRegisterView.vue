<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertyStore } from '@/stores/property/property'
import { useAuthStore } from '@/stores/auth/auth'
import PropertyBasicInfoForm from '@/components/property/PropertyBasicInfoForm.vue'
import PropertyDetailForm from '@/components/property/PropertyDetailForm.vue'
import PropertyContactForm from '@/components/property/PropertyContactForm.vue'

const router = useRouter()
const propertyStore = usePropertyStore()
const authStore = useAuthStore()

// 로그인 상태 확인 (임시로 비활성화)
// onMounted(() => {
//   if (!authStore.isAuthenticated) {
//     console.log('로그인이 필요합니다. 로그인 페이지로 이동합니다.')
//     alert('매물 등록을 위해서는 로그인이 필요합니다.')
//     router.push('/auth/login')
//     return
//   }
// })

// 현재 단계
const currentStep = ref(1)
const totalSteps = 4

// 폼 데이터
const formData = ref({
  // 등록자 유형
  registrantType: 'owner', // 'owner' | 'tenant'

  // 매물 종류
  propertyType: 'sale', // 'sale' | 'jeonse' | 'monthly'

  // 매매가/보증금
  price: '',
  deposit: '',

  // 부동산 유형
  buildingType: 'house', // 'apartment' | 'officetel' | 'villa' | 'house'
  buildingName: '',

  // 주소
  roadAddress: '',
  detailAddress: '',
  buildingDong: '', // 동 정보
  buildingHo: '', // 호수 정보
  complexNo: '', // 건물 일련번호
  sido: '',
  sigungu: '',
  siCode: '',
  eupmyeondong: '',
  zonecode: '',
  bname: '',

  // 면적
  area: '',

  // 입주 가능 날짜
  moveInType: 'immediate', // 'immediate' | 'date' | 'negotiable'
  moveInDate: '',

  // 매물 상세
  title: '',
  features: '',
  description: '',
  images: [],

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

// 폼 제출
const handleSubmit = async () => {
  if (priceError.value) {
    alert('가격을 확인해주세요.')
    return
  }

  // API 요청 구조에 맞게 데이터 변환
  const requestData = {
    Building: {
      sellerNickname: formData.value.contactName,
      saleType: formData.value.propertyType === 'sale' ? 'SALE' : 'RENT',
      price: parseInt(removeCommas(formData.value.price)),
      deposit: parseInt(removeCommas(formData.value.deposit)) || 0,
      bookmarkCount: 0,
      createdAt: new Date().toISOString(),
      buildingName: formData.value.buildingName,
      sellerType: formData.value.registrantType === 'owner' ? 'INDIVIDUAL' : 'AGENT',
      propertyType: formData.value.buildingType.toUpperCase(),
      moveDate: formData.value.moveInDate || new Date().toISOString(),
      infoOneline: formData.value.title,
      infoBuilding: formData.value.description,
      contactName: formData.value.contactName,
      contactPhone: formData.value.contactPhone,
      facility: formData.value.features,
    },
    complexList: {
      resType: formData.value.buildingType === 'apartment' ? '아파트' : '단독주택',
      complexName: formData.value.buildingName,
      complexNo: 123, // 실제로는 API에서 받아온 값 사용
      sido: formData.value.sido,
      sigungu: formData.value.sigungu,
      siCode: formData.value.siCode,
      eupmyeondong: formData.value.eupmyeondong,
      transactionId: 'some-transaction-id', // 실제로는 고유 ID 생성
      address: `${formData.value.roadAddress} ${formData.value.detailAddress}`,
      zonecode: formData.value.zonecode,
      buildingName: formData.value.buildingName,
      bname: formData.value.bname,
      buildingDong: formData.value.buildingDong, // 동 정보
      buildingHo: formData.value.buildingHo, // 호수 정보
      complexNo: formData.value.complexNo, // 건물 일련번호
      buildingNameFromAPI: formData.value.buildingName, // API에서 받은 건물명
    },
    multipartFile: formData.value.images,
  }

  const result = await propertyStore.createProperty(requestData)

  if (result.success) {
    alert(result.message)
    // 성공 시 이전 페이지로 이동
    router.back()
  } else {
    alert(result.message)
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
    if (!formData.value.roadAddress) missingFields.push('도로명 주소')
    if (!formData.value.area) missingFields.push('전용 면적')
    if (!formData.value.moveInType) missingFields.push('입주 가능 날짜')
  } else if (step === 2) {
    // 2단계: 매물 상세 설명 및 사진
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
    1: { title: '매물 기본 정보', description: '필수 정보를 입력해주세요.' },
    2: { title: '매물 상세 설명 및 사진', description: '상세 정보와 사진을 추가해주세요.' },
    3: { title: '담당자 정보', description: '연락 가능한 정보를 입력해주세요.' },
    4: { title: '매물 등록', description: '입력한 정보를 확인하고 등록해주세요.' },
  }
  return steps[currentStep.value]
})

// 취소
const handleCancel = () => {
  if (confirm('매물 등록을 취소하시겠습니까?')) {
    // 이전 페이지로 이동
    router.back()
  }
}
</script>

<template>
  <div class="min-h-screen" style="background: var(--bg-1)">
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

    <!-- 메인 콘텐츠 -->
    <div class="flex items-center justify-center p-4 lg:p-12 min-h-screen">
      <div class="w-full max-w-4xl">
        <!-- 통합 헤더 & 매물 등록 폼 -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <!-- 헤더 섹션 -->
          <div class="p-4 lg:p-8" style="background: var(--bg-2); border-bottom: 1px solid #e5e7eb">
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
                    >매물 등록</span
                  >
                </div>
                <h1 class="text-xl lg:text-3xl font-bold mb-2 lg:mb-3" style="color: var(--text-2)">
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
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style="color: var(--text-3)"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                      clip-rule="evenodd"
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

            <!-- 매물 등록 폼 -->
            <form @submit.prevent="handleSubmit" class="space-y-12 lg:space-y-16">
              <!-- 1. 매물 기본 정보 -->
              <div v-if="currentStep === 1">
                <PropertyBasicInfoForm
                  :model-value="formData"
                  @update:model-value="(value) => Object.assign(formData, value)"
                />
              </div>

              <!-- 2. 매물 상세 설명 및 사진 -->
              <div v-if="currentStep === 2">
                <PropertyDetailForm
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

              <!-- 4. 매물 등록 확인 -->
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
                        <span class="text-text-1">주소:</span>
                        {{ formData.roadAddress || '미입력' }}
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
                      <div>
                        <span class="text-text-1">사진:</span> {{ formData.images.length }}장
                      </div>

                      <!-- 등록된 사진 미리보기 -->
                      <div v-if="formData.images.length > 0" class="mt-4">
                        <span class="text-text-1 block mb-2">등록된 사진:</span>
                        <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                          <div
                            v-for="(image, index) in formData.images"
                            :key="index"
                            class="relative group"
                          >
                            <img
                              :src="getImageUrl(image)"
                              :alt="`매물 사진 ${index + 1}`"
                              class="w-full h-16 object-cover rounded border border-gray-200 cursor-pointer hover:border-brand-3 transition-colors"
                              @click="openImageModal(image, index)"
                            />
                            <div
                              class="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 rounded-tl"
                            >
                              {{ index + 1 }}
                            </div>
                          </div>
                        </div>
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
                  <div class="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center">
                    <!-- 이전 버튼 (1단계가 아닐 때만 표시) -->
                    <button
                      v-if="currentStep > 1"
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

                    <!-- 다음/등록 버튼 -->
                    <button
                      v-if="currentStep < totalSteps"
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
                      매물 등록하기
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
