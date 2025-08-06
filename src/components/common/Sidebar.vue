<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-50',
      'w-80 h-screen',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- 헤더 영역 -->
    <div class="flex justify-between items-center p-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800">
        {{ type === 'A' ? '메뉴' : '계정' }}
      </h2>
      <button
        @click="$emit('close')"
        class="text-brand-3 hover:text-brand-2 transition-colors duration-200"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>

    <!-- 메뉴 목록 -->
    <nav class="py-4">
      <ul class="space-y-0">
        <!-- 타입 A 메뉴 항목들 -->
        <template v-if="type === 'A'">
          <li v-for="(item, index) in typeAMenuItems" :key="index">
            <button
              @click="handleMenuClick(item)"
              class="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors duration-200 flex items-center"
            >
              <span class="text-base">{{ item.label }}</span>
            </button>
            <div
              v-if="index < typeAMenuItems.length - 1"
              class="border-b border-gray-200 mx-4"
            ></div>
          </li>
        </template>

        <!-- 타입 B 메뉴 항목들 -->
        <template v-if="type === 'B'">
          <li v-for="(item, index) in typeBMenuItems" :key="index">
            <button
              @click="handleMenuClick(item)"
              class="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors duration-200 flex items-center"
            >
              <span class="text-base">{{ item.label }}</span>
            </button>
            <div
              v-if="index < typeBMenuItems.length - 1"
              class="border-b border-gray-200 mx-4"
            ></div>
          </li>
        </template>
      </ul>
    </nav>
  </aside>

  <!-- 배경 오버레이 -->
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 bg-black bg-opacity-50 z-40"
  ></div>
</template>

<script setup>
import { computed } from 'vue'

// Props 정의
const props = defineProps({
  // 사이드바 타입 (A 또는 B)
  type: {
    type: String,
    default: 'A',
    validator: (value) => ['A', 'B'].includes(value),
  },
  // 사이드바 열림 상태
  isOpen: {
    type: Boolean,
    default: false,
  },
  // 커스텀 메뉴 아이템 (선택사항)
  customMenuItems: {
    type: Array,
    default: () => [],
  },
})

// 이벤트 정의
const emit = defineEmits(['close', 'menu-click'])

// 타입 A 메뉴 아이템 (왼쪽 패널)
const typeAMenuItems = computed(() => {
  if (props.customMenuItems.length > 0) {
    return props.customMenuItems
  }
  return [
    { id: 'map', label: '지도', action: 'navigate' },
    { id: 'chat', label: '채팅', action: 'navigate' },
    { id: 'trade', label: '거래', action: 'navigate' },
    { id: 'mypage', label: '마이페이지', action: 'navigate' },
  ]
})

// 타입 B 메뉴 아이템 (오른쪽 패널)
const typeBMenuItems = computed(() => {
  if (props.customMenuItems.length > 0) {
    return props.customMenuItems
  }
  return [
    { id: 'login', label: '로그인', action: 'navigate' },
    { id: 'signup', label: '회원가입', action: 'navigate' },
  ]
})

// 메뉴 클릭 핸들러
const handleMenuClick = (item) => {
  emit('menu-click', item)
}
</script>

<style scoped>
/* 추가 커스텀 스타일이 필요한 경우 여기에 작성 */
</style>
