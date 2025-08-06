<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertyStore } from '@/stores/property/property'
import Button from '@/components/common/Button.vue'
import PropertyBasicInfoForm from '@/components/property/PropertyBasicInfoForm.vue'
import PropertyDetailForm from '@/components/property/PropertyDetailForm.vue'
import PropertyContactForm from '@/components/property/PropertyContactForm.vue'

const router = useRouter()
const propertyStore = usePropertyStore()

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
  buildingName: '', // 건물명
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

// 가격 유효성 검사
const priceError = computed(() => {
  if (!formData.value.price) return ''
  const price = parseInt(formData.value.price)
  if (price > 4900000000) {
    return '가격은 49억 원을 초과할 수 없습니다'
  }
  return ''
})

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
      price: parseInt(formData.value.price),
      deposit: parseInt(formData.value.deposit) || 0,
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

// 취소
const handleCancel = (event) => {
  event.preventDefault()
  if (confirm('매물 등록을 취소하시겠습니까?')) {
    // 이전 페이지로 이동
    router.back()
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg-1">
    <!-- 메인 콘텐츠 -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 페이지 제목 -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-text-2 mb-2">
            <i class="fa-solid fa-home mr-2 text-brand-3"></i>
            매물 등록
          </h1>
          <p class="text-text-1">새로운 매물 정보를 입력해주세요</p>
        </div>

        <!-- 매물 등록 폼 -->
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- 1. 매물 기본 정보 -->
          <PropertyBasicInfoForm
            :model-value="formData"
            @update:model-value="(value) => Object.assign(formData, value)"
          />

          <!-- 2. 매물 상세 설명 및 사진 -->
          <PropertyDetailForm
            :model-value="formData"
            @update:model-value="(value) => Object.assign(formData, value)"
          />

          <!-- 3. 담당자 정보 -->
          <PropertyContactForm
            :model-value="formData"
            @update:model-value="(value) => Object.assign(formData, value)"
          />

          <!-- 액션 버튼 -->
          <div class="flex justify-center space-x-4 pt-6">
            <Button variant="button1" size="lg" type="submit" class="w-32"> 매물 등록하기 </Button>
            <Button variant="button11" size="lg" type="button" @click="handleCancel" class="w-32">
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
