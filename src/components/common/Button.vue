<template>
  <!--
    공용 Button 컴포넌트
    - 10가지 variant 지원 (button1 ~ button10)
    - 3가지 size 지원 (sm, md, lg)
    - 아이콘 지원 (왼쪽/오른쪽)
    - 전체 너비 옵션
    - 비활성화 상태 지원
  -->
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg',
      // Variant styles - 버튼 스타일 (색상, 배경 등)
      variantClasses[variant],
      // Size classes - 버튼 크기 (패딩, 폰트 크기 등)
      sizeClasses[variant],
      // Full width - 전체 너비 옵션
      { 'w-full': fullWidth },
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <!-- 왼쪽 아이콘 (iconRight가 false일 때) -->
    <i v-if="icon && !iconRight" :class="[icon, 'mr-2', iconSizeClasses[variant]]"></i>

    <!-- button4의 기본 다운로드 아이콘 (비활성화) -->
    <!-- <svg
      v-if="variant === 'button4' && !icon"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="{1.5}"
      stroke="currentColor"
      class="mr-2 w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg> -->

    <!-- 버튼 텍스트 (slot으로 외부에서 주입) -->
    <span v-if="$slots.default">
      <slot />
    </span>

    <!-- 오른쪽 아이콘 (iconRight가 true일 때) -->
    <i v-if="icon && iconRight" :class="[icon, 'ml-2', iconSizeClasses[variant]]"></i>
  </button>
</template>

<script setup>
// Props 정의
const props = defineProps({
  // 버튼 스타일 변형 (10가지 옵션)
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      [
        'button1',
        'button2',
        'button3',
        'button4',
        'button5',
        'button6',
        'button7',
        'button8',
        'button9',
        'button10',
        'button11',
      ].includes(value),
  },
  // 버튼 크기 (sm, md, lg)
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  // 아이콘 컴포넌트 (문자열 또는 컴포넌트 객체)
  icon: {
    type: [String, Object],
    default: null,
  },
  // 아이콘을 오른쪽에 배치할지 여부
  iconRight: {
    type: Boolean,
    default: false,
  },
  // 전체 너비 사용 여부
  fullWidth: {
    type: Boolean,
    default: false,
  },
  // 버튼 비활성화 여부
  disabled: {
    type: Boolean,
    default: false,
  },
})

// 이벤트 정의
defineEmits(['click'])

// Tailwind CSS 클래스 기반 스타일 (원래 CSS 변수 색상 유지)
const variantClasses = {
  button1: 'bg-brand-3 hover:bg-brand-2 text-text-3', // 진한 녹색 배경, 흰색 텍스트
  button2: 'bg-brand-4 hover:bg-brand-3 text-text-3', // 연한 녹색 배경, 흰색 텍스트
  button3: 'bg-status-1 hover:bg-blue-700 text-text-3', // 파란색 배경, 흰색 텍스트
  button4: 'bg-status-1 hover:bg-blue-700 text-text-3', // 파란색 배경 (아이콘용), 흰색 텍스트
  button5: 'bg-transparent border-2 border-brand-2 text-brand-2 hover:bg-brand-2 hover:text-text-3', // 투명 배경, 녹색 테두리
  button6: 'bg-brand-3 hover:bg-brand-2 text-text-3', // 진한 녹색 배경, 흰색 텍스트
  button7: 'bg-transparent border-2 border-brand-3 text-brand-3 hover:bg-brand-3 hover:text-text-3', // 투명 배경, 진한 녹색 테두리
  button8: 'bg-brand-3 hover:bg-brand-2 text-text-3', // 진한 녹색 배경 (전체 너비용), 흰색 텍스트
  button9: 'bg-status-2 hover:bg-red-700 text-text-3', // 빨간색 배경, 흰색 텍스트
  button10: 'bg-bg-2 hover:bg-gray-50 text-text-2 border-text-1', // 흰색 배경, 회색 테두리
  button11: 'bg-white border border-red-500 text-red-500 hover:bg-red-50', // 흰색 배경, 빨간색 테두리와 텍스트
}

// 크기별 클래스 (variant별로 고정 크기 - 원래 CSS와 동일)
const sizeClasses = {
  button1: 'w-50 h-12.5 px-4 py-2 text-base', // 200x50px
  button2: 'w-50 h-12.5 px-4 py-2 text-base', // 200x50px
  button3: 'w-50 h-12.5 px-4 py-2 text-base', // 200x50px
  button4: 'w-50 h-12.5 px-4 py-2 text-base', // 200x50px
  button5: 'w-20.75 h-9.5 px-2 py-1 text-sm', // 83x38px
  button6: 'w-20.75 h-9.5 px-2 py-1 text-sm', // 83x38px
  button7: 'w-15 h-9.5 px-2 py-1 text-sm', // 60x38px
  button8: 'w-26.25 h-8.5 px-3 py-1 text-sm', // 105x34px
  button9: 'w-45.75 h-10 px-4 py-2 text-base', // 183x40px
  button10: 'w-45.75 h-10 px-4 py-2 text-base', // 183x40px
  button11: 'w-45.75 h-10 px-4 py-2 text-base', // 183x40px
}

// 아이콘 크기 클래스
const iconSizeClasses = {
  button1: 'w-5 h-5',
  button2: 'w-5 h-5',
  button3: 'w-5 h-5',
  button4: 'w-5 h-5',
  button5: 'w-4 h-4',
  button6: 'w-4 h-4',
  button7: 'w-4 h-4',
  button8: 'w-4 h-4',
  button9: 'w-5 h-5',
  button10: 'w-5 h-5',
  button11: 'w-5 h-5',
}
</script>

<style scoped>
/* 추가 커스텀 스타일이 필요한 경우 여기에 작성 */
</style>
