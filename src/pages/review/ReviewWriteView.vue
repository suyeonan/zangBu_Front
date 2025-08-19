<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReviewStore } from '@/stores/review/review'
import { createReview, validateAddressForReview } from '@/api/review/review'

const route = useRoute()
const router = useRouter()
const reviewStore = useReviewStore()

const buildingId = route.params.buildingId

// 건물명을 동적으로 가져오기
const buildingName = computed(() => {
  return reviewStore.buildingInfo?.buildingName || '로딩 중...'
})

// 주소 검증 상태
const addressValidation = ref({
  isValid: false,
  isChecking: false,
  message: '',
  error: '',
})

// 리뷰 작성 폼 데이터
const reviewForm = ref({
  rank: 5, // 기본값 5점
  floor: '중층', // 기본값 중층
  title: '', // 리뷰 제목
  content: '', // 리뷰 내용
})

// 층수 옵션
const floorOptions = [
  { value: '저층', label: '저층 (1-3층)' },
  { value: '중층', label: '중층 (4-7층)' },
  { value: '고층', label: '고층 (8층 이상)' },
]

// 별점 렌더링
const renderStars = (rank) => {
  return '★'.repeat(rank) + '☆'.repeat(5 - rank)
}

// 별점 클릭 처리
const setRank = (rank) => {
  reviewForm.value.rank = rank
}

// 주소 검증 수행
const performAddressValidation = async () => {
  if (!buildingId) {
    alert('건물 정보가 없습니다.')
    return
  }

  addressValidation.value.isChecking = true
  addressValidation.value.error = ''
  addressValidation.value.message = ''

  try {
    const result = await validateAddressForReview(parseInt(buildingId))

    if (result.isValid) {
      addressValidation.value.isValid = true
      addressValidation.value.message = result.message
      alert('주소 검증이 완료되었습니다! 이제 리뷰를 작성할 수 있습니다.')
    } else {
      addressValidation.value.isValid = false
      addressValidation.value.error = result.message || '주소 검증에 실패했습니다.'
      alert(
        '주소 검증에 실패했습니다. 주민등록초본에 기록된 주소와 해당 건물의 주소가 일치하지 않습니다.'
      )
    }
  } catch (error) {
    console.error('주소 검증 실패:', error)
    addressValidation.value.error = '주소 검증 중 오류가 발생했습니다.'
    alert('주소 검증 중 오류가 발생했습니다. 다시 시도해주세요.')
  } finally {
    addressValidation.value.isChecking = false
  }
}

// 뒤로가기
const goBack = () => {
  router.back()
}

// 리뷰 작성 제출
const submitReview = async () => {
  // 주소 검증이 완료되지 않은 경우
  if (!addressValidation.value.isValid) {
    alert('먼저 주소 검증을 완료해주세요.')
    return
  }

  if (!reviewForm.value.title.trim()) {
    alert('리뷰 제목을 입력해주세요.')
    return
  }

  if (!reviewForm.value.content.trim()) {
    alert('리뷰 내용을 입력해주세요.')
    return
  }

  try {
    const reviewData = {
      buildingId: parseInt(buildingId),
      addressId: reviewStore.buildingInfo?.address || '',
      floor: reviewForm.value.floor,
      rank: reviewForm.value.rank,
      title: reviewForm.value.title.trim(),
      content: reviewForm.value.content.trim(),
    }

    await createReview(reviewData)

    // 성공 메시지
    alert('리뷰가 성공적으로 작성되었습니다!')

    // 리뷰 목록 페이지로 이동
    router.push(`/review/${buildingId}`)
  } catch (error) {
    console.error('리뷰 작성 실패:', error)
    alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.')
  }
}

onMounted(async () => {
  if (buildingId) {
    try {
      // 건물 정보 조회
      await reviewStore.getBuildingInfoById(buildingId)
    } catch (error) {
      console.error('건물 정보 조회 실패:', error)
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="text-gray-600 hover:text-gray-800 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-green-800">리뷰 작성</h1>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <div class="max-w-2xl mx-auto">
        <!-- 건물 정보 -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-2">{{ buildingName }}</h2>
          <p class="text-gray-600">건물 ID: {{ buildingId }}</p>
        </div>

        <!-- 주소 검증 섹션 -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">주소 검증</h3>
          <p class="text-sm text-gray-600 mb-4">
            리뷰를 작성하려면 주민등록초본에 기록된 주소와 해당 건물의 주소가 일치해야 합니다.
          </p>

          <!-- 검증 상태 표시 -->
          <div v-if="addressValidation.message || addressValidation.error" class="mb-4">
            <div
              v-if="addressValidation.message"
              class="p-3 bg-green-100 border border-green-300 rounded-md"
            >
              <p class="text-green-800 text-sm">{{ addressValidation.message }}</p>
            </div>
            <div
              v-if="addressValidation.error"
              class="p-3 bg-red-100 border border-red-300 rounded-md"
            >
              <p class="text-red-800 text-sm">{{ addressValidation.error }}</p>
            </div>
          </div>

          <!-- 검증 버튼 -->
          <div class="flex items-center space-x-3">
            <button
              @click="performAddressValidation"
              :disabled="addressValidation.isChecking"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="addressValidation.isChecking">검증 중...</span>
              <span v-else-if="addressValidation.isValid">검증 완료</span>
              <span v-else>주소 검증하기</span>
            </button>

            <div v-if="addressValidation.isValid" class="flex items-center text-green-600">
              <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="text-sm font-medium">검증 완료</span>
            </div>
          </div>
        </div>

        <!-- 리뷰 작성 폼 -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">리뷰 작성</h3>

          <!-- 별점 선택 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">별점</label>
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  @click="setRank(star)"
                  class="text-2xl transition-colors"
                  :class="star <= reviewForm.rank ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ★
                </button>
              </div>
              <span class="text-sm text-gray-600 ml-2">{{ reviewForm.rank }}점</span>
            </div>
          </div>

          <!-- 층수 선택 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">층수</label>
            <select
              v-model="reviewForm.floor"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option v-for="option in floorOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- 리뷰 제목 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">리뷰 제목</label>
            <input
              v-model="reviewForm.title"
              type="text"
              placeholder="리뷰 제목을 입력해주세요"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- 리뷰 내용 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">리뷰 내용</label>
            <textarea
              v-model="reviewForm.content"
              rows="6"
              placeholder="이 건물에 대한 솔직한 리뷰를 작성해주세요. (최소 10자 이상)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            ></textarea>
            <div class="text-sm text-gray-500 mt-1">
              {{ reviewForm.content.length }}자 (최소 10자)
            </div>
          </div>

          <!-- 제출 버튼 -->
          <div class="flex justify-end space-x-3">
            <button
              @click="goBack"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              @click="submitReview"
              :disabled="
                !addressValidation.isValid ||
                !reviewForm.title.trim() ||
                reviewForm.content.length < 10
              "
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ addressValidation.isValid ? '리뷰 작성' : '주소 검증 필요' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
