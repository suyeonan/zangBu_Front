<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReviewStore } from '@/stores/review/review'
import { createReview } from '@/api/review/review'

const route = useRoute()
const router = useRouter()
const reviewStore = useReviewStore()

const buildingId = route.params.buildingId

// 건물명을 동적으로 가져오기
const buildingName = computed(() => {
  return reviewStore.buildingInfo?.buildingName || '로딩 중...'
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

// 뒤로가기
const goBack = () => {
  router.back()
}

// 리뷰 작성 제출
const submitReview = async () => {
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
              :disabled="!reviewForm.title.trim() || reviewForm.content.length < 10"
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              리뷰 작성
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
