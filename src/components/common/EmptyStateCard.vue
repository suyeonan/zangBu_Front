<template>
  <div
    :class="[
      'flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed min-h-[200px] shadow-sm hover:shadow-md transition-shadow duration-300',
      getBackgroundClass(),
      getBorderClass(),
    ]"
  >
    <div :class="['w-16 h-16 mb-4', getIconColorClass()]">
      <svg
        v-if="iconType === 'review'"
        fill="currentColor"
        viewBox="0 0 24 24"
        class="w-full h-full"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        />
      </svg>
      <svg
        v-else-if="iconType === 'like'"
        fill="currentColor"
        viewBox="0 0 24 24"
        class="w-full h-full"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
      <svg
        v-else-if="iconType === 'new'"
        fill="currentColor"
        viewBox="0 0 24 24"
        class="w-full h-full"
      >
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
      <svg v-else fill="currentColor" viewBox="0 0 24 24" class="w-full h-full">
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
        />
        <path
          d="M12 6c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"
        />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ title }}</h3>
    <p class="text-sm text-gray-600 text-center max-w-xs">{{ description }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '매물이 없습니다',
  },
  description: {
    type: String,
    default: '현재 등록된 매물이 없습니다. 나중에 다시 확인해주세요.',
  },
  iconType: {
    type: String,
    default: 'default',
    validator: (value) => ['review', 'like', 'new', 'default'].includes(value),
  },
})

// 배경 색상 클래스 반환
const getBackgroundClass = () => {
  return 'bg-gradient-to-br from-gray-50 to-slate-50'
}

// 테두리 색상 클래스 반환
const getBorderClass = () => {
  return 'border-gray-200'
}

// 아이콘 색상 클래스 반환
const getIconColorClass = () => {
  return 'text-gray-400'
}
</script>
