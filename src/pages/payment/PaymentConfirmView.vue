<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
import { getBuyerInfo } from '@/api/payment/payment.js'

const router = useRouter()
const route = useRoute()

console.log('PaymentConfirmView 스크립트 로드됨')

// 결제 정보 (URL 파라미터에서 받아옴)
const paymentInfo = reactive({
  selectedOption: null,
  customerName: '',
  customerEmail: '',
  customerMobilePhone: '',
})

// UI 상태
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const tossPayments = ref(null)
const widgets = ref(null)
const buyerInfoLoading = ref(false)

// 현재 URL 정보
const currentUrl = ref('')
const currentDomain = ref('')

// URL 정보 업데이트
const updateUrlInfo = () => {
  currentUrl.value = window.location.href
  currentDomain.value = window.location.origin
}

// 주문 ID 생성
const generateOrderId = () => {
  return window.btoa(Math.random()).slice(0, 20)
}

// 구매자 정보 로드
const loadBuyerInfo = async () => {
  buyerInfoLoading.value = true
  try {
    const buyerInfo = await getBuyerInfo()
    paymentInfo.customerName = buyerInfo.name || ''
    paymentInfo.customerEmail = buyerInfo.email || ''
    paymentInfo.customerMobilePhone = buyerInfo.phone || ''
    console.log('구매자 정보 로드 완료:', buyerInfo)
  } catch (error) {
    console.error('구매자 정보 로드 실패:', error)
    // 백엔드 실패 시 더미 데이터 사용
    paymentInfo.customerName = '테스트 사용자'
    paymentInfo.customerEmail = 'test@example.com'
    paymentInfo.customerMobilePhone = '01012345678'
    console.log('더미 데이터로 대체:', paymentInfo)
    errorMessage.value = '백엔드 연결 실패로 테스트 데이터를 사용합니다.'
  } finally {
    buyerInfoLoading.value = false
  }
}

// 토스페이먼츠 초기화
const initializeTossPayments = async () => {
  try {
    console.log('토스페이먼츠 SDK 로딩 시작...')
    console.log('loadTossPayments 함수:', typeof loadTossPayments)
    console.log('ANONYMOUS 상수:', ANONYMOUS)

    if (typeof loadTossPayments !== 'function') {
      throw new Error(
        'loadTossPayments 함수를 찾을 수 없습니다. SDK가 제대로 로드되었는지 확인해주세요.'
      )
    }

    tossPayments.value = await loadTossPayments('test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm')
    console.log('토스페이먼츠 SDK 로딩 완료')
    console.log('tossPayments 객체:', tossPayments.value)

    if (!tossPayments.value) {
      throw new Error('토스페이먼츠 SDK 객체가 null입니다.')
    }

    widgets.value = tossPayments.value.widgets({
      customerKey: ANONYMOUS,
    })
    console.log('위젯 초기화 완료')
    console.log('widgets 객체:', widgets.value)

    if (!widgets.value) {
      throw new Error('토스페이먼츠 위젯 객체가 null입니다.')
    }

    // 선택된 옵션의 금액으로 위젯 설정
    if (paymentInfo.selectedOption) {
      await widgets.value.setAmount({
        currency: 'KRW',
        value: paymentInfo.selectedOption.price,
      })
      console.log('결제 금액 설정 완료:', paymentInfo.selectedOption.price)
    }

    // DOM이 준비될 때까지 대기
    await nextTick()

    // 결제 수단 렌더링
    await widgets.value.renderPaymentMethods({
      selector: '#payment-method',
      variantKey: 'DEFAULT',
    })
    console.log('결제 수단 위젯 렌더링 완료')

    // 약관 렌더링
    await widgets.value.renderAgreement({
      selector: '#agreement',
      variantKey: 'AGREEMENT',
    })
    console.log('약관 위젯 렌더링 완료')

    successMessage.value = '토스페이먼츠 결제 시스템이 준비되었습니다.'
  } catch (error) {
    console.error('토스페이먼츠 초기화 실패:', error)
    errorMessage.value = `결제 시스템 초기화에 실패했습니다: ${error.message}`

    // 더 자세한 디버깅 정보
    console.log('현재 페이지 URL:', window.location.href)
    console.log('현재 도메인:', window.location.origin)
    console.log('토스페이먼츠 SDK 상태:', {
      loadTossPayments: typeof loadTossPayments,
      ANONYMOUS: ANONYMOUS,
      tossPayments: tossPayments.value,
      widgets: widgets.value,
    })
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  console.log('PaymentConfirmView 컴포넌트 마운트됨')

  // URL 정보 업데이트
  updateUrlInfo()

  // URL 파라미터에서 선택된 옵션 정보 가져오기
  const selectedOptionData = route.query.selectedOption
  if (selectedOptionData) {
    try {
      paymentInfo.selectedOption = JSON.parse(decodeURIComponent(selectedOptionData))
      console.log('URL에서 받은 선택 옵션:', paymentInfo.selectedOption)
    } catch (error) {
      console.error('선택 옵션 파싱 실패:', error)
      errorMessage.value = '결제 정보를 불러오는데 실패했습니다.'
      return
    }
  } else {
    console.error('선택된 옵션 정보가 없습니다.')
    errorMessage.value = '결제 정보가 없습니다. 결제 페이지로 돌아가주세요.'
    return
  }

  await nextTick()
  console.log('nextTick 완료')

  // 구매자 정보 로드
  await loadBuyerInfo()

  // 토스페이먼츠 초기화
  await initializeTossPayments()
})

// 결제 요청
const handlePayment = async () => {
  console.log('handlePayment 호출됨')

  // 입력값 검증
  if (!paymentInfo.customerName.trim()) {
    errorMessage.value = '구매자 이름이 없습니다.'
    return
  }

  if (!paymentInfo.customerEmail.trim()) {
    errorMessage.value = '구매자 이메일이 없습니다.'
    return
  }

  if (!paymentInfo.customerMobilePhone.trim()) {
    errorMessage.value = '구매자 휴대폰 번호가 없습니다.'
    return
  }

  if (!paymentInfo.selectedOption) {
    errorMessage.value = '선택된 결제 옵션이 없습니다.'
    return
  }

  if (!widgets.value) {
    errorMessage.value =
      '토스페이먼츠 결제 시스템이 초기화되지 않았습니다. 페이지를 새로고침해주세요.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    console.log('결제 요청 시작...')
    console.log('선택된 옵션:', paymentInfo.selectedOption)
    console.log('위젯 상태:', widgets.value)
    console.log('구매자 정보:', {
      name: paymentInfo.customerName,
      email: paymentInfo.customerEmail,
      phone: paymentInfo.customerMobilePhone,
    })

    const orderId = generateOrderId()
    console.log('주문 ID 생성:', orderId)

    // 결제 요청 정보 로깅
    const paymentRequest = {
      orderId: orderId,
      orderName: paymentInfo.selectedOption.title,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
      customerEmail: paymentInfo.customerEmail,
      customerName: paymentInfo.customerName,
      customerMobilePhone: paymentInfo.customerMobilePhone,
    }
    console.log('토스페이먼츠 결제 요청 정보:', paymentRequest)

    await widgets.value.requestPayment(paymentRequest)
    console.log('결제 요청 완료')
  } catch (error) {
    console.error('결제 요청 실패:', error)
    console.error('오류 상세 정보:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    errorMessage.value = `결제 요청 중 오류가 발생했습니다: ${error.message}`
  } finally {
    loading.value = false
  }
}

// 뒤로 가기
const goBack = () => {
  router.push('/payment')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto px-4 max-w-3xl lg:max-w-5xl xl:max-w-6xl">
      <!-- 헤더 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">결제 확인</h1>
        <p class="text-gray-600">선택하신 결제 정보를 확인하고 결제를 진행해주세요</p>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-red-600 text-sm">{{ errorMessage }}</p>
      </div>

      <!-- 성공 메시지 -->
      <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
        <p class="text-green-600 text-sm">{{ successMessage }}</p>
      </div>
      <!-- 본문: 좌/우 2컬럼 레이아웃 (데스크탑) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left: 선택된 결제 정보 + 구매자 정보 -->
        <div class="space-y-6">
          <!-- 선택된 결제 정보 -->
          <div v-if="paymentInfo.selectedOption" class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">선택된 결제 정보</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">상품명:</span>
                <span class="font-medium text-gray-900">{{
                  paymentInfo.selectedOption.title
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">결제 금액:</span>
                <span class="font-medium text-gray-900">
                  ₩{{ paymentInfo.selectedOption.price.toLocaleString() }}
                  {{ paymentInfo.selectedOption.period || '건당' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">설명:</span>
                <span class="font-medium text-gray-900">{{
                  paymentInfo.selectedOption.description
                }}</span>
              </div>
            </div>
          </div>

          <!-- 구매자 정보 섹션 -->
          <div class="bg-white rounded-lg shadow-md p-6">
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
                  v-model="paymentInfo.customerName"
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
                  v-model="paymentInfo.customerEmail"
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
                  v-model="paymentInfo.customerMobilePhone"
                  :placeholder="buyerInfoLoading ? '정보를 불러오는 중...' : '휴대폰 번호'"
                  readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right: 결제 위젯 + 버튼 + 안내/디버깅 -->
        <div class="space-y-6">
          <!-- 토스페이먼츠 위젯 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="space-y-4">
              <!-- 결제 수단 선택 위젯 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">결제 수단 선택</label>
                <div id="payment-method" class="w-full">
                  <!-- 위젯 로딩 중 또는 실패 시 대체 UI -->
                  <div v-if="!widgets" class="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p class="text-gray-600 text-sm">토스페이먼츠 위젯을 로딩 중입니다...</p>
                  </div>
                </div>
              </div>

              <!-- 약관 동의 위젯 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">약관 동의</label>
                <div id="agreement" class="w-full">
                  <!-- 위젯 로딩 중 또는 실패 시 대체 UI -->
                  <div v-if="!widgets" class="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p class="text-gray-600 text-sm">약관 동의 위젯을 로딩 중입니다...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 버튼 영역 -->
          <div class="flex space-x-4">
            <!-- 뒤로 가기 버튼 -->
            <button
              @click="goBack"
              class="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
            >
              뒤로 가기
            </button>

            <!-- 결제 버튼 -->
            <button
              @click="handlePayment"
              :disabled="loading || buyerInfoLoading"
              class="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                결제 처리 중...
              </span>
              <span v-else>결제하기</span>
            </button>
          </div>

          <!-- 디버깅 정보 (개발용) -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-yellow-900 mb-2">🔧 디버깅 정보</h3>
            <div class="text-sm text-yellow-800 space-y-2">
              <div>
                <strong>선택된 옵션:</strong> {{ paymentInfo.selectedOption ? '있음' : '없음' }}
              </div>
              <div>
                <strong>구매자 정보:</strong>
                {{ paymentInfo.customerName ? '로드됨' : '로드 안됨' }}
              </div>
              <div>
                <strong>토스페이먼츠 위젯:</strong> {{ widgets ? '초기화됨' : '초기화 안됨' }}
              </div>
              <div><strong>현재 URL:</strong> {{ currentUrl }}</div>
            </div>
          </div>

          <!-- 안내사항 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-blue-900 mb-2">💡 안내사항</h3>
            <ul class="text-sm text-blue-800 space-y-1">
              <li>• 구매자 정보(이름, 이메일, 휴대폰 번호)는 백엔드에서 자동으로 불러와집니다.</li>
              <li>• 구매자 정보는 읽기 전용이며, 수정할 수 없습니다.</li>
              <li>• 정보가 표시되지 않으면 "정보 새로고침" 버튼을 클릭해주세요.</li>
              <li>• 이 페이지는 토스페이먼츠 위젯을 사용합니다.</li>
              <li>• 실제 결제가 이루어지지 않으며, 샌드박스 환경에서 테스트됩니다.</li>
              <li>• 결제 완료 후 성공/실패 페이지로 리다이렉트됩니다.</li>
              <li>• 문제가 발생하면 브라우저 개발자 도구(F12)의 콘솔을 확인해주세요.</li>
              <li>• 토스페이먼츠 페이지가 안 뜨면 위의 디버깅 정보를 확인해주세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 토스페이먼츠 위젯 스타일 */
#payment-method,
#agreement {
  width: 100%;
  min-height: 100px;
}
</style>
