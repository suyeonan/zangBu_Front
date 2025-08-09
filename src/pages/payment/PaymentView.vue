<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getBuyerInfo } from '@/api/payment/payment.js'

const router = useRouter()

console.log('PaymentView 스크립트 로드됨')

// 결제 옵션 데이터
const paymentOptions = [
  {
    id: 'per-case',
    title: '건당 결제',
    description: '부동산 분석 리포트 1개',
    price: 5000,
    features: ['상세 부동산 분석 리포트', '시장 가격 분석', '투자 수익성 평가'],
    buttonText: '리포트 구매하기',
  },
  {
    id: 'membership',
    title: '멤버십 플랜',
    description: '무제한 리포트 + 프리미엄 기능',
    price: 29000,
    period: '월간',
    features: ['무제한 분석 리포트', '리뷰 및 평점 열람', '광고 제거', '우선 고객 지원'],
    buttonText: '멤버십 시작하기',
    recommended: true,
  },
]

// 결제 폼 데이터
const paymentForm = reactive({
  selectedOption: null,
  customerName: '',
  customerEmail: '',
  customerMobilePhone: '',
})

// 선택된 결제 옵션 표시용
const selectedPaymentInfo = computed(() => {
  if (!paymentForm.selectedOption) return null
  return {
    title: paymentForm.selectedOption.title,
    price: paymentForm.selectedOption.price,
    period: paymentForm.selectedOption.period || '건당',
    description: paymentForm.selectedOption.description,
  }
})

// UI 상태
const errorMessage = ref('')
const buyerInfoLoading = ref(false)

// 결제 옵션 선택
const selectPaymentOption = (option) => {
  paymentForm.selectedOption = option
  console.log('선택된 결제 옵션:', option)
}

// 구매자 정보 로드
const loadBuyerInfo = async () => {
  buyerInfoLoading.value = true
  try {
    const buyerInfo = await getBuyerInfo()
    paymentForm.customerName = buyerInfo.name || ''
    paymentForm.customerEmail = buyerInfo.email || ''
    paymentForm.customerMobilePhone = buyerInfo.phone || ''
    console.log('구매자 정보 로드 완료:', buyerInfo)
  } catch (error) {
    console.error('구매자 정보 로드 실패:', error)
    errorMessage.value = '구매자 정보를 불러오는데 실패했습니다.'
  } finally {
    buyerInfoLoading.value = false
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  console.log('PaymentView 컴포넌트 마운트됨')

  // 구매자 정보 로드
  await loadBuyerInfo()
})

// 결제 확인 페이지로 이동
const goToPaymentConfirm = (option) => {
  console.log('결제 확인 페이지로 이동:', option)

  // 선택된 옵션을 URL 파라미터로 전달
  const selectedOptionParam = encodeURIComponent(JSON.stringify(option))
  router.push({
    path: '/payment/confirm',
    query: {
      selectedOption: selectedOptionParam,
    },
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto px-4 max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
      <!-- 헤더 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">결제 옵션</h1>
        <p class="text-gray-600">원하시는 결제 옵션을 선택해주세요</p>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-red-600 text-sm">{{ errorMessage }}</p>
      </div>

      <!-- 성공 메시지 -->
      <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
        <p class="text-green-600 text-sm">{{ successMessage }}</p>
      </div>

      <!-- 선택된 결제 정보 표시 -->
      <div v-if="selectedPaymentInfo" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 class="text-sm font-medium text-blue-900 mb-2">선택된 결제 정보</h3>
        <div class="space-y-1 text-sm text-blue-800">
          <div class="flex justify-between">
            <span>상품명:</span>
            <span class="font-medium">{{ selectedPaymentInfo.title }}</span>
          </div>
          <div class="flex justify-between">
            <span>결제 금액:</span>
            <span class="font-medium"
              >₩{{ selectedPaymentInfo.price.toLocaleString() }}
              {{ selectedPaymentInfo.period }}</span
            >
          </div>
          <div class="flex justify-between">
            <span>설명:</span>
            <span class="font-medium">{{ selectedPaymentInfo.description }}</span>
          </div>
        </div>
      </div>

      <!-- 구매자 정보 섹션 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">구매자 정보</h3>
          <div class="flex items-center space-x-2">
            <div v-if="buyerInfoLoading" class="flex items-center text-sm text-blue-600">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              정보 불러오는 중...
            </div>
            <button
              v-if="!buyerInfoLoading"
              type="button"
              @click="loadBuyerInfo"
              class="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              정보 새로고침
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 구매자 이름 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">구매자 이름</label>
            <input
              type="text"
              v-model="paymentForm.customerName"
              :placeholder="buyerInfoLoading ? '정보를 불러오는 중...' : '구매자 이름'"
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          <!-- 이메일 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              v-model="paymentForm.customerEmail"
              :placeholder="buyerInfoLoading ? '정보를 불러오는 중...' : '이메일'"
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          <!-- 휴대폰 번호 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">휴대폰 번호</label>
            <input
              type="tel"
              v-model="paymentForm.customerMobilePhone"
              :placeholder="buyerInfoLoading ? '정보를 불러오는 중...' : '휴대폰 번호'"
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <!-- 결제 옵션 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 2xl:gap-10">
        <!-- 건당 결제 -->
        <div
          :class="[
            'bg-white rounded-lg shadow-md p-6 border-2 transition-colors cursor-pointer h-full flex flex-col',
            selectedPaymentInfo?.title === paymentOptions[0].title
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300',
          ]"
          @click="paymentForm.selectedOption = paymentOptions[0]"
        >
          <div class="text-center mb-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ paymentOptions[0].title }}</h3>
            <p class="text-gray-600">{{ paymentOptions[0].description }}</p>
          </div>

          <div class="text-center mb-6">
            <div class="text-3xl font-bold text-gray-900">
              ₩{{ paymentOptions[0].price.toLocaleString() }}
            </div>
            <div class="text-sm text-gray-500">건당</div>
          </div>

          <ul class="space-y-3 mb-6">
            <li
              v-for="feature in paymentOptions[0].features"
              :key="feature"
              class="flex items-center"
            >
              <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="text-gray-700">{{ feature }}</span>
            </li>
          </ul>

          <button
            @click="goToPaymentConfirm(paymentOptions[0])"
            :disabled="buyerInfoLoading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors mt-auto"
          >
            {{ paymentOptions[0].buttonText }}
          </button>
        </div>

        <!-- 멤버십 플랜 -->
        <div
          :class="[
            'bg-white rounded-lg shadow-md p-6 border-2 relative cursor-pointer h-full flex flex-col',
            selectedPaymentInfo?.title === paymentOptions[1].title
              ? 'border-green-500 bg-green-50'
              : 'border-green-300 hover:border-green-400',
          ]"
          @click="paymentForm.selectedOption = paymentOptions[1]"
        >
          <!-- 추천 태그 -->
          <div class="absolute -top-3 left-6">
            <span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
              >추천</span
            >
          </div>

          <div class="text-center mb-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ paymentOptions[1].title }}</h3>
            <p class="text-gray-600">{{ paymentOptions[1].description }}</p>
          </div>

          <div class="text-center mb-6">
            <div class="text-3xl font-bold text-gray-900">
              ₩{{ paymentOptions[1].price.toLocaleString() }}
            </div>
            <div class="text-sm text-gray-500">{{ paymentOptions[1].period }}</div>
          </div>

          <ul class="space-y-3 mb-6">
            <li
              v-for="feature in paymentOptions[1].features"
              :key="feature"
              class="flex items-center"
            >
              <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="text-gray-700">{{ feature }}</span>
            </li>
          </ul>

          <button
            @click="goToPaymentConfirm(paymentOptions[1])"
            :disabled="buyerInfoLoading"
            class="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors mt-auto"
          >
            {{ paymentOptions[1].buttonText }}
          </button>
        </div>
      </div>

      <!-- 안내사항 -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-blue-900 mb-2">💡 안내사항</h3>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• 구매자 정보(이름, 이메일, 휴대폰 번호)는 백엔드에서 자동으로 불러와집니다.</li>
          <li>• 구매자 정보는 읽기 전용이며, 수정할 수 없습니다.</li>
          <li>• 정보가 표시되지 않으면 "정보 새로고침" 버튼을 클릭해주세요.</li>
          <li>• 결제 옵션을 클릭하여 선택할 수 있으며, 선택된 옵션의 정보가 상단에 표시됩니다.</li>
          <li>• 건당 결제는 1회성 결제이며, 멤버십은 월간 자동 결제입니다.</li>
          <li>
            • "리포트 구매하기" 또는 "멤버십 시작하기" 버튼을 클릭하면 결제 확인 페이지로
            이동합니다.
          </li>
          <li>• 결제 확인 페이지에서 토스페이먼츠를 통해 실제 결제를 진행합니다.</li>
          <li>• 실제 결제가 이루어지지 않으며, 샌드박스 환경에서 테스트됩니다.</li>
          <li>• 결제 완료 후 성공/실패 페이지로 리다이렉트됩니다.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 토스페이먼츠 위젯 스타일 */
.btn-wrapper {
  padding: 0 24px;
}

#payment-method,
#agreement {
  width: 100%;
  min-height: 100px;
}
</style>
