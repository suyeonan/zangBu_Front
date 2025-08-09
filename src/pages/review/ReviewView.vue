<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReviewStore } from '@/stores/review/review'

const route = useRoute()
const router = useRouter()
const reviewStore = useReviewStore()

const buildingId = computed(() => route.params.buildingId)

// 건물명을 동적으로 가져오기
const buildingName = computed(() => {
  return reviewStore.buildingInfo?.buildingName || '로딩 중...'
})

// 별점 렌더링 함수
const renderStars = (rank) => {
  return '★'.repeat(rank) + '☆'.repeat(5 - rank)
}

// 층수 태그 색상
const getFloorColor = (floor) => {
  const floorMap = {
    저층: 'bg-gray-200 text-gray-700',
    중층: 'bg-gray-300 text-gray-800',
    고층: 'bg-gray-400 text-white',
  }
  return floorMap[floor] || 'bg-gray-200 text-gray-700'
}

// 리뷰 선택
const selectReview = async (reviewId) => {
  try {
    await reviewStore.selectReview(reviewId)
  } catch (error) {
    console.error('리뷰 상세 조회 실패:', error)
  }
}

// 페이지 변경
const changePage = async (page) => {
  try {
    await reviewStore.changePage(page, buildingId.value)
  } catch (error) {
    console.error('페이지 변경 실패:', error)
  }
}

// 뒤로가기
const goBack = () => {
  router.back()
}

// 글쓰기 페이지로 이동
const goToWrite = () => {
  router.push(`/review/write/${buildingId.value}`)
}

// 페이지 로드 시 건물 정보와 리뷰 목록 조회
onMounted(async () => {
  if (buildingId.value) {
    try {
      // 건물 정보 먼저 조회
      await reviewStore.getBuildingInfoById(buildingId.value)

      // 리뷰 목록 조회
      await reviewStore.getReviewsByBuildingId(buildingId.value, 1, 5)

      // 첫 번째 리뷰가 있으면 자동으로 선택
      if (reviewStore.reviews.length > 0) {
        await selectReview(reviewStore.reviews[0].reviewId)
      }

      // 테스트용 콘솔 출력
      console.log('=== 리뷰 페이지 테스트 정보 ===')
      console.log('현재 Building ID:', buildingId.value)
      console.log('건물 정보:', reviewStore.buildingInfo)
      console.log('리뷰 목록:', reviewStore.reviews)
      console.log('페이지네이션:', reviewStore.pagination)
      console.log('사용 가능한 Building ID: 1-12')
      console.log('예시 URL: /review/1, /review/2, /review/3...')
    } catch (error) {
      console.error('데이터 조회 실패:', error)
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
          <h1 class="text-2xl font-bold text-green-800">{{ buildingName }}</h1>
        </div>
        <button
          @click="goToWrite"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          글쓰기
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-80px)]">
      <!-- Left Panel: Review List -->
      <div
        class="w-full lg:w-1/3 xl:w-2/5 border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto max-h-[50vh] lg:max-h-none"
      >
        <h2 class="text-lg font-bold text-gray-800 mb-4">매물 리뷰 목록 - {{ buildingName }}</h2>

        <!-- 테스트 안내 메시지 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p class="text-sm text-blue-800">
            <strong>테스트 안내:</strong> Building ID 1-12로 테스트 가능<br />
            예시: /review/1, /review/2, /review/3...
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="reviewStore.loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>

        <!-- Review List -->
        <div v-else class="space-y-3">
          <div
            v-for="review in reviewStore.reviews"
            :key="review.reviewId"
            @click="selectReview(review.reviewId)"
            :class="[
              'bg-white rounded-lg p-4 cursor-pointer transition-all hover:shadow-md border-2',
              reviewStore.currentReview?.reviewId === review.reviewId
                ? 'border-green-500 shadow-md'
                : 'border-gray-200',
            ]"
          >
            <!-- Review Title -->
            <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2">
              {{ review.title }}
            </h3>

            <!-- Review Meta -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="text-yellow-500 text-sm">★</span>
                <span class="text-sm text-gray-600">{{ review.rank }}</span>
              </div>
              <span
                :class="['px-2 py-1 rounded-full text-xs font-medium', getFloorColor(review.floor)]"
              >
                {{ review.floor }}
              </span>
            </div>

            <!-- Reviewer -->
            <div class="flex items-center space-x-1">
              <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="text-sm text-gray-600">{{ review.reviewerNickName }}</span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="reviewStore.pagination.total > 0" class="mt-6 flex justify-center">
          <div class="flex space-x-2">
            <button
              v-if="reviewStore.pagination.currentPage > 1"
              @click="changePage(reviewStore.pagination.currentPage - 1)"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              이전
            </button>

            <span class="px-3 py-1 text-sm text-gray-600">
              {{ reviewStore.pagination.currentPage }} /
              {{ Math.ceil(reviewStore.pagination.total / reviewStore.pagination.pageSize) }}
            </span>

            <button
              v-if="reviewStore.pagination.hasNext"
              @click="changePage(reviewStore.pagination.currentPage + 1)"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Review Detail -->
      <div class="flex-1 p-6 overflow-y-auto">
        <h2 class="text-lg font-bold text-gray-800 mb-6">리뷰 상세보기</h2>

        <!-- Loading State -->
        <div v-if="reviewStore.loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>

        <!-- Review Detail -->
        <div
          v-else-if="reviewStore.currentReview"
          class="bg-white rounded-lg p-6 border border-gray-200"
        >
          <!-- Review Title -->
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            {{ reviewStore.currentReview.title }}
          </h3>

          <!-- Meta Information -->
          <div class="flex items-center space-x-4 mb-4">
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                getFloorColor(reviewStore.currentReview.floor || '중층'),
              ]"
            >
              {{ reviewStore.currentReview.floor || '중층' }}
            </span>
            <div class="flex items-center space-x-1">
              <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="text-sm text-gray-600">{{
                reviewStore.buildingInfo?.address || '주소 정보 없음'
              }}</span>
            </div>
          </div>

          <!-- Reviewer -->
          <div class="flex items-center space-x-1 mb-4">
            <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span class="text-sm text-gray-600">{{
              reviewStore.currentReview.reviewerNickname
            }}</span>
          </div>

          <!-- Rating -->
          <div class="flex items-center space-x-2 mb-6">
            <div class="flex text-yellow-500">
              <span v-for="i in 5" :key="i" class="text-xl">
                {{ i <= reviewStore.currentReview.rank ? '★' : '☆' }}
              </span>
            </div>
            <span class="text-sm text-gray-600">{{ reviewStore.currentReview.rank }}/5</span>
          </div>

          <!-- Review Content -->
          <div class="mb-6">
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {{ reviewStore.currentReview.content }}
            </p>
          </div>

          <!-- Creation Date -->
          <div class="text-right">
            <span class="text-sm text-gray-500">
              작성일:
              {{ new Date(reviewStore.currentReview.createdAt).toLocaleDateString('ko-KR') }}
            </span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg class="w-16 h-16 mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <p class="text-lg">리뷰를 선택해주세요</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
