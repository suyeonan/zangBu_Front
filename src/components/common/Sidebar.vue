<template>
  <aside
    :class="[
      'fixed bg-white shadow-lg z-50',
      // 데스크탑에서는 애니메이션 없음, 모바일에서는 transition 적용
      'lg:transition-none transition-all duration-300',
      // 데스크탑에서는 전체 너비, 모바일에서는 320px
      'lg:w-full w-80',
      // 데스크탑에서는 헤더 높이(96px) 아래에서 시작, 모바일에서는 최상단
      'lg:top-24 top-0',
      'right-0',
      // 데스크탑에서는 자동 높이, 모바일에서는 전체 화면 높이
      'lg:h-auto h-screen',
      // 데스크탑에서는 애니메이션 없음, 모바일에서는 오른쪽에서 왼쪽으로
      isOpen ? 'lg:translate-y-0 translate-x-0' : 'lg:translate-y-0 translate-x-full',
    ]"
  >
    <!-- 헤더 영역 -->
    <div class="flex justify-between items-center p-4 border-b border-gray-200 lg:hidden">
      <h2 class="text-lg font-semibold text-gray-800">
        {{ type === 'A' ? '메뉴' : '계정' }}
      </h2>
      <button
        @click="$emit('close')"
        class="w-10 h-10 flex items-center justify-center text-green-900 hover:text-brand-1 transition-colors"
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
      <!-- 데스크탑에서는 가로 배치, 모바일에서는 세로 배치 -->
      <ul
        :class="[
          'lg:flex lg:flex-row lg:justify-center lg:space-x-8 lg:space-y-0 lg:border-b-0',
          'space-y-0',
        ]"
      >
        <!-- 타입 A 메뉴 항목들 -->
        <template v-if="type === 'A'">
          <li v-for="(item, index) in typeAMenuItems" :key="index">
            <button
              @click="handleMenuClick(item)"
              class="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors duration-200 flex items-center lg:justify-center"
            >
              <span class="text-base">{{ item.label }}</span>
            </button>
            <div
              v-if="index < typeAMenuItems.length - 1"
              class="border-b border-gray-200 mx-4 lg:hidden"
            ></div>
          </li>
        </template>

        <!-- 타입 B 메뉴 항목들 -->
        <template v-if="type === 'B'">
          <li v-for="(item, index) in typeBMenuItems" :key="index">
            <button
              @click="handleMenuClick(item)"
              class="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors duration-200 flex items-center lg:justify-center"
            >
              <span class="text-base">{{ item.label }}</span>
            </button>
            <div
              v-if="index < typeBMenuItems.length - 1"
              class="border-b border-gray-200 mx-4 lg:hidden"
            ></div>
          </li>
        </template>
      </ul>
    </nav>
  </aside>

  <!-- 배경 오버레이 (모바일에서만) -->
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
  ></div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth/auth'

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

// Auth store 사용
const authStore = useAuthStore()

// 로그인 상태 확인 (더미로 로그아웃 상태)
const isLoggedIn = computed(() => {
  // 유저 스토어 구현이 덜 되어있으므로 하드코딩으로 로그아웃 상태
  return false

  // TODO: 유저 스토어 구현 완료 후 아래 주석 해제하여 사용
  // return authStore.isAuthenticated
})

// 타입 A 메뉴 아이템 (왼쪽 패널)
const typeAMenuItems = computed(() => {
  if (props.customMenuItems.length > 0) {
    return props.customMenuItems
  }

  const baseItems = [
    { id: 'map', label: '지도', action: 'navigate' },
    { id: 'chat', label: '채팅', action: 'navigate' },
    { id: 'trade', label: '거래', action: 'navigate' },
    { id: 'property-search', label: '매물 찾기', action: 'navigate' },
    { id: 'property-register', label: '매물 올리기', action: 'navigate' },
  ]

  // 로그인 상태에 따라 마이페이지 또는 로그인 버튼 추가
  if (isLoggedIn.value) {
    baseItems.push({ id: 'mypage', label: '마이페이지', action: 'navigate' })
  } else {
    baseItems.push({ id: 'login', label: '로그인', action: 'navigate' })
  }

  return baseItems
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
