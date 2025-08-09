<script setup>
import { ref, watch } from 'vue'
import Input from '@/components/common/Input.vue'

// Props 정의
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      contactName: '',
      contactPhone: '',
    }),
  },
})

// Emits 정의
const emit = defineEmits(['update:modelValue'])

// 폼 데이터
const formData = ref({
  contactName: props.modelValue.contactName || '',
  contactPhone: props.modelValue.contactPhone || '',
})

// props 변경 감지
watch(
  () => props.modelValue,
  (newValue) => {
    formData.value = {
      contactName: newValue.contactName || '',
      contactPhone: newValue.contactPhone || '',
    }
  },
  { deep: true }
)

// 전화번호 포맷팅 함수
const formatPhoneNumber = (value) => {
  if (!value) return ''
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '')

  // 11자리를 초과하지 않도록 제한
  const limitedNumbers = numbers.substring(0, 11)

  // 전화번호 형식으로 포맷팅
  if (limitedNumbers.length <= 3) {
    return limitedNumbers
  } else if (limitedNumbers.length <= 7) {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
  } else {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`
  }
}

// 전화번호 입력 처리
const handlePhoneInput = (event) => {
  const value = event.target.value
  const formattedValue = formatPhoneNumber(value)

  // 포맷된 값으로 입력 필드 업데이트
  event.target.value = formattedValue
  formData.value.contactPhone = formattedValue
  emit('update:modelValue', { ...formData.value })
}

// 전화번호 입력 키 제한 (숫자만 허용)
const handlePhoneKeypress = (event) => {
  const char = String.fromCharCode(event.which)

  // 숫자가 아닌 경우 입력 차단
  if (!/\d/.test(char)) {
    event.preventDefault()
    return
  }

  // 이미 11자리인 경우 추가 입력 차단
  const currentNumbers = event.target.value.replace(/[^\d]/g, '')
  if (currentNumbers.length >= 11) {
    event.preventDefault()
    return
  }
}

// 담당자 이름 포맷팅 (한글, 영어만 허용)
const formatContactName = (value) => {
  if (!value) return ''
  // 한글(가-힣), 영어(a-z, A-Z), 공백만 허용
  return value.replace(/[^가-힣a-zA-Z\s]/g, '')
}

// 담당자 이름 입력 처리
const handleNameInput = (event) => {
  const value = event.target.value
  const formattedValue = formatContactName(value)

  // 포맷된 값으로 입력 필드 업데이트
  event.target.value = formattedValue
  formData.value.contactName = formattedValue
  emit('update:modelValue', { ...formData.value })
}

// 담당자 이름 키 제한 (한글, 영어, 공백만 허용)
const handleNameKeypress = (event) => {
  const char = String.fromCharCode(event.which)

  // 한글, 영어, 공백이 아닌 경우 입력 차단
  if (!/[가-힣a-zA-Z\s]/.test(char)) {
    event.preventDefault()
    return
  }
}

// 데이터 변경 시 부모에게 전달
const updateFormData = (field, value) => {
  if (field === 'contactPhone') {
    // 전화번호는 포맷팅 적용
    const formattedValue = formatPhoneNumber(value)
    formData.value[field] = formattedValue
  } else if (field === 'contactName') {
    // 담당자 이름은 한글, 영어만 허용
    const formattedValue = formatContactName(value)
    formData.value[field] = formattedValue
  } else {
    formData.value[field] = value
  }
  emit('update:modelValue', { ...formData.value })
}
</script>

<template>
  <div class="space-y-8">
    <!-- 담당자 이름 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-3">담당자 이름</label>
      <input
        :value="formData.contactName"
        @input="handleNameInput"
        @keypress="handleNameKeypress"
        type="text"
        placeholder="예) 홍길동"
        class="w-full px-4 py-3 text-base leading-6 text-text-2 bg-bg-2 border border-bg-1 rounded-lg outline-none box-border placeholder:text-text-1 placeholder:text-base focus:border-brand-3 focus:ring-1 focus:ring-brand-3 transition-colors"
      />
    </div>

    <!-- 연락처 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-3">연락처</label>
      <input
        :value="formData.contactPhone"
        @input="handlePhoneInput"
        @keypress="handlePhoneKeypress"
        type="text"
        placeholder="예) 010-1234-5678"
        class="w-full px-4 py-3 text-base leading-6 text-text-2 bg-bg-2 border border-bg-1 rounded-lg outline-none box-border placeholder:text-text-1 placeholder:text-base focus:border-brand-3 focus:ring-1 focus:ring-brand-3 transition-colors"
      />
    </div>
  </div>
</template>
