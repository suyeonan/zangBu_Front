<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-[400px]">
      <h2 class="text-xl font-semibold mb-6 text-center">본인인증을 진행해주세요</h2>

      <!-- 이름 -->
      <div class="mb-4">
        <label class="block mb-1 font-medium text-sm"
          >이름 <span class="text-red-500">*</span></label
        >
        <input
          v-model="name"
          type="text"
          placeholder="이름을 입력하세요"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
        />
      </div>

      <!-- 주민등록번호 -->
      <div class="mb-4">
        <label class="block mb-1 font-medium text-sm"
          >주민등록번호 <span class="text-red-500">*</span></label
        >
        <div class="flex space-x-2">
          <input
            v-model="birth"
            type="text"
            placeholder="ex) 900101"
            class="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
          <input
            v-model="identity"
            type="text"
            placeholder="주민등록번호 뒤 7자리"
            class="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>
      </div>

      <!-- 주민등록번호 발급일자 -->
      <div class="mb-4">
        <label class="block mb-1 font-medium text-sm"
          >주민등록번호 발급일자 <span class="text-red-500">*</span></label
        >
        <input
          v-model="issueDate"
          type="text"
          placeholder="ex) 150809"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
        />
      </div>

      <!-- 통신사 -->
      <div class="mb-4">
        <label class="block mb-1 font-medium text-sm"
          >통신사 <span class="text-red-500">*</span></label
        >
        <select
          v-model="telecom"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
        >
          <option value="" disabled>통신사를 선택하세요</option>
          <option value="SKT">SKT</option>
          <option value="KT">KT</option>
          <option value="LGU+">LG U+</option>
          <option value="SKT알뜰폰">SKT 알뜰폰</option>
          <option value="KT알뜰폰">KT 알뜰폰</option>
          <option value="LGU+알뜰폰">LGU+ 알뜰폰</option>
        </select>
      </div>

      <!-- 전화번호 -->
      <div class="mb-6">
        <label class="block mb-1 font-medium text-sm"
          >전화번호 <span class="text-red-500">*</span></label
        >
        <input
          v-model="phone"
          type="text"
          placeholder="ex) 010 - 1234 - 5678"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
        />
      </div>

      <!-- 기본주소 -->
      <div class="mb-6">
        <label class="block mb-1 font-medium text-sm"
          >기본주소 <span class="text-red-500">*</span></label
        >
        <input
          v-model="baseAddress"
          type="text"
          placeholder="주소 검색"
          @click="openAddressSearch"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
        />
      </div>

      <!-- 상세주소 (동/호수) -->
      <div class="mb-6">
        <label class="block mb-1 font-medium text-sm"
          >상세주소 <span class="text-red-500">*</span></label
        >
        <div class="flex space-x-2">
          <input
            v-model="building"
            placeholder="동"
            class="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
          <input
            v-model="unit"
            placeholder="호수"
            class="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>
      </div>

      <!-- 다음 버튼 -->
      <button
        @click="handleSubmit"
        class="w-full bg-brand-4 hover:bg-brand-3 text-white py-2 rounded"
      >
        다음
      </button>

      <p v-if="errorMessage" class="text-red-500 text-sm mt-3 text-center">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 상태
const name = ref('')
const birth = ref('')
const identity = ref('')
const issueDate = ref('')
const telecom = ref('')
const phone = ref('')

const baseAddress = ref('')
const building = ref('')
const unit = ref('')

const errorMessage = ref('')

function getTelecomCode(telecomValue) {
  if (telecomValue.includes('SKT')) return '0'
  if (telecomValue.includes('KT')) return '1'
  if (telecomValue.includes('LGU+')) return '2'
  return '' // 해당 없으면 빈 문자열 (또는 에러 처리)
}

// 본인인증 제출
async function handleSubmit() {
  errorMessage.value = ''

  if (
    !name.value ||
    !birth.value ||
    !identity.value ||
    !issueDate.value ||
    !telecom.value ||
    !phone.value ||
    !baseAddress.value ||
    !building.value ||
    !unit.value
  ) {
    errorMessage.value = '모든 필수 항목을 입력해주세요.'
    return
  }

  const payload = {
    name: name.value,
    birth: birth.value,
    identity: identity.value,
    issueDate: issueDate.value,
    telecom: getTelecomCode(telecom.value),
    phone: phone.value.replace(/[^0-9]/g, ''),

    //주소
    baseAddress: baseAddress.value,
    building: building.value,
    unit: unit.value,
  }

  try {
    const { data } = await axios.post('/verify/authentication', payload)
    // 백엔드 AuthVerify 형태 가정
    const { resAuthenticity, resAuthenticityDesc } = data || {}

    if (resAuthenticity === 'Y') {
      // 인증 성공 → 회원가입으로 이동
      sessionStorage.setItem('verified', 'true')
      router.push('/auth/signup')
    } else {
      // 인증 실패 사유 표시
      errorMessage.value = resAuthenticityDesc || '본인 인증에 실패했습니다.'
    }
  } catch (err) {
    errorMessage.value = '인증 요청 중 오류가 발생했습니다.'
  }

  //일단 회원가입으로 이동하게
  sessionStorage.setItem('verified', 'true')
  router.push('/auth/signup')
}
</script>
