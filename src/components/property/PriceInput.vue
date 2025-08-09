<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  maxValue: {
    type: Number,
    default: null,
  },
  maxValueMessage: {
    type: String,
    default: '',
  },
  unit: {
    type: String,
    default: '원',
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

// 숫자에 콤마 추가하는 함수
const formatNumber = (value) => {
  if (!value) return ''
  const numericValue = value.toString().replace(/[^\d]/g, '')
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 콤마 제거하고 숫자만 반환하는 함수
const removeCommas = (value) => {
  if (!value) return ''
  return value.toString().replace(/,/g, '')
}

// 가격 유효성 검사
const priceError = computed(() => {
  if (!props.modelValue) return ''

  if (props.maxValue) {
    const price = parseInt(removeCommas(props.modelValue))
    if (price > props.maxValue) {
      return (
        props.maxValueMessage ||
        `최대 ${formatNumber(props.maxValue.toString())}${props.unit}까지 입력 가능합니다`
      )
    }
  }

  return ''
})

// 가격 포맷팅 처리
const handleInput = (event) => {
  const value = event.target.value
  const numericValue = removeCommas(value)

  // 최대값 검증 - 40억 초과 시 입력 차단
  if (props.maxValue && parseInt(numericValue) > props.maxValue) {
    console.log(
      `🚫 가격 제한: ${parseInt(
        numericValue
      ).toLocaleString()}원은 최대값 ${props.maxValue.toLocaleString()}원을 초과합니다.`
    )
    // 이전 값으로 되돌리기
    event.target.value = props.modelValue
    return
  }

  const formattedValue = formatNumber(numericValue)

  emit('update:modelValue', formattedValue)
  event.target.value = formattedValue
}

// 숫자만 입력 허용
const handleKeypress = (event) => {
  const char = event.key

  // 숫자가 아닌 경우 차단 (백스페이스, 삭제, 화살표 키 등은 허용)
  if (
    !/\d/.test(char) &&
    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)
  ) {
    event.preventDefault()
    return
  }

  // 숫자 입력인 경우 최대값 검증
  if (/\d/.test(char) && props.maxValue) {
    const currentValue = event.target.value
    const numericValue = removeCommas(currentValue + char)

    if (parseInt(numericValue) > props.maxValue) {
      event.preventDefault()
    }
  }
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-text-2 mb-3">
      {{ label }}
    </label>
    <div class="flex items-center space-x-2">
      <input
        :value="modelValue"
        @input="handleInput"
        @keypress="handleKeypress"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-3 text-base leading-6 text-text-2 bg-bg-2 border border-bg-1 rounded-lg outline-none box-border placeholder:text-text-1 placeholder:text-base focus:border-brand-3 focus:ring-1 focus:ring-brand-3 transition-colors"
        :class="{ 'border-status-2 focus:border-status-2 focus:ring-status-2': priceError }"
      />
      <span class="text-base font-medium text-text-2">{{ unit }}</span>
    </div>
    <p v-if="priceError" class="text-status-2 text-sm mt-1">
      <i class="fa-solid fa-circle-exclamation mr-1"></i>
      {{ priceError }}
    </p>
  </div>
</template>
