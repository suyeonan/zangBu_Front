<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 선택된 결제 옵션
const selectedOption = ref('per-case') // 'per-case' 또는 'membership'

// 선택된 결제 수단
const selectedPaymentMethod = ref('')

// 결제 처리
const handlePayment = () => {
  if (!selectedPaymentMethod.value) {
    alert('결제 수단을 선택해주세요.')
    return
  }

  // 실제 결제 로직은 여기에 구현
  console.log('결제 처리:', {
    option: selectedOption.value,
    paymentMethod: selectedPaymentMethod.value,
  })

  // 결제 성공 시 처리
  alert('결제가 완료되었습니다!')
  router.push('/')
}

// 뒤로가기
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
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
          <h1 class="text-2xl font-bold text-gray-800">멤버십 결제</h1>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- 결제 옵션 -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-6">결제 옵션</h2>

          <!-- 건당 결제 -->
          <div class="mb-6 p-4 border border-gray-200 rounded-lg">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-800">건당 결제</h3>
                <p class="text-gray-600 text-sm">부동산 분석 리포트 1개</p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-800">₩5,000</div>
                <div class="text-sm text-gray-500">건당</div>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">상세 부동산 분석 리포트</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">시장 가격 분석</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">투자 수익성 평가</span>
              </div>
            </div>

            <button
              @click="selectedOption = 'per-case'"
              :class="[
                'w-full py-3 px-4 rounded-lg border transition-colors',
                selectedOption === 'per-case'
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100',
              ]"
            >
              리포트 구매하기
            </button>
          </div>

          <!-- 구분선 -->
          <div class="border-t border-green-200 mb-6"></div>

          <!-- 멤버십 플랜 -->
          <div class="relative p-4 bg-green-50 border border-green-200 rounded-lg">
            <!-- 추천 배지 -->
            <div class="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              추천
            </div>

            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-800">멤버십 플랜</h3>
                <p class="text-gray-600 text-sm">무제한 리포트 + 프리미엄 기능</p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-800">₩29,000</div>
                <div class="text-sm text-gray-500">월간</div>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">무제한 분석 리포트</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">리뷰 및 평점 열람</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">광고 제거</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">우선 고객 지원</span>
              </div>
            </div>

            <button
              @click="selectedOption = 'membership'"
              :class="[
                'w-full py-3 px-4 rounded-lg border transition-colors',
                selectedOption === 'membership'
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-green-500 text-green-600 hover:bg-green-50',
              ]"
            >
              멤버십 시작하기
            </button>
          </div>
        </div>

        <!-- 결제 수단 -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-6">결제 수단</h2>

          <div class="space-y-3">
            <button
              @click="selectedPaymentMethod = 'kakao'"
              :class="[
                'w-full py-4 px-6 rounded-lg border transition-colors flex items-center justify-center',
                selectedPaymentMethod === 'kakao'
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600',
              ]"
            >
              <span class="font-semibold">카카오페이로 결제</span>
            </button>

            <button
              @click="selectedPaymentMethod = 'toss'"
              :class="[
                'w-full py-4 px-6 rounded-lg border transition-colors flex items-center justify-center',
                selectedPaymentMethod === 'toss'
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600',
              ]"
            >
              <span class="font-semibold">토스페이로 결제</span>
            </button>
          </div>
        </div>

        <!-- 결제 요약 -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-6">결제 요약</h2>

          <div class="flex justify-between items-center mb-6">
            <span class="text-gray-700">
              {{ selectedOption === 'per-case' ? '부동산 분석 리포트 1개' : '멤버십 플랜 (월간)' }}
            </span>
            <span class="text-xl font-bold text-gray-800">
              {{ selectedOption === 'per-case' ? '₩5,000' : '₩29,000' }}
            </span>
          </div>

          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-start">
              <span class="mr-2">•</span>
              <span>결제 완료 후 즉시 서비스 이용이 가능합니다.</span>
            </div>
            <div class="flex items-start">
              <span class="mr-2">•</span>
              <span>멤버십은 아무 시간에나 해지할 수 있습니다.</span>
            </div>
            <div class="flex items-start">
              <span class="mr-2">•</span>
              <span>환불 정책은 이용약관을 참고해 주세요.</span>
            </div>
          </div>
        </div>

        <!-- 결제 버튼 -->
        <button
          @click="handlePayment"
          :disabled="!selectedPaymentMethod"
          class="w-full py-4 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ selectedOption === 'per-case' ? '₩5,000 결제하기' : '₩29,000 결제하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 추가 스타일링이 필요한 경우 여기에 작성 */
</style>
