<template>
  <header class="w-full bg-white shadow-sm">
    <!-- Desktop Header -->
    <div
      class="hidden lg:flex w-full max-w-7xl mx-auto h-24 bg-white items-center px-4 lg:px-6 xl:px-8"
    >
      <!-- Logo Section -->
      <div class="flex-shrink-0 w-56 h-14 flex items-center">
        <img
          class="w-[229px] h-[86px] object-contain cursor-pointer"
          src="@/assets/logo.png"
          alt="Logo"
          @click="handleLogoClick"
        />
      </div>

      <!-- Main Content Section -->
      <div class="flex-1 flex justify-between items-center ml-4 md:ml-6 lg:ml-8">
        <!-- Search Bar -->
        <div class="flex-1 max-w-2xl mx-4 md:mx-6 lg:mx-8">
          <div class="relative">
            <div class="flex items-center bg-zinc-100 rounded-lg px-3 py-2">
              <i class="fas fa-search text-neutral-600 text-base mr-2"></i>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                @input="handleSearchInput"
                type="text"
                placeholder="지역, 매물명, 지하철역으로 검색"
                class="flex-1 bg-transparent text-text-1 text-sm md:text-base font-normal font-inter placeholder-text-1 outline-none ml-2"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation and User Section -->
        <div class="flex items-center gap-4 md:gap-6">
          <!-- Navigation Links -->
          <nav class="flex items-center gap-6 md:gap-8">
            <button
              @click="handleNavigation('map')"
              class="text-green-900 text-base md:text-lg font-medium font-roboto hover:text-brand-1 transition-colors whitespace-nowrap"
            >
              지도
            </button>
            <button
              @click="handleNavigation('chat')"
              class="text-green-900 text-base md:text-lg font-medium font-roboto hover:text-brand-1 transition-colors whitespace-nowrap"
            >
              채팅
            </button>

            <!-- 알림 -->
            <!-- <button
              @click="handleNavigation('notification')"
              class="text-green-900 text-base md:text-lg font-medium font-roboto hover:text-brand-1 transition-colors whitespace-nowrap"
            >
              알림
            </button> -->

            <button
              @click="handleNavigation('trade')"
              class="text-green-900 text-base md:text-lg font-medium font-roboto hover:text-brand-1 transition-colors whitespace-nowrap"
            >
              거래
            </button>
            <button
              @click="handleNavigation('mypage')"
              class="text-green-900 text-base md:text-lg font-medium font-roboto hover:text-brand-1 transition-colors whitespace-nowrap"
            >
              마이페이지
            </button>
          </nav>

          <!-- User Profile Section -->
          <div class="flex items-center gap-2 md:gap-3">
            <div class="flex items-center gap-2 md:gap-3">
              <div
                class="w-8 h-8 md:w-9 md:h-9 bg-brand-3 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 md:w-6 md:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.1212 17.8969C19.679 16.8496 19.0374 15.8984 18.2321 15.0961C17.4292 14.2915 16.4781 13.65 15.4313 13.207C15.4219 13.2023 15.4126 13.2 15.4032 13.1953C16.8633 12.1406 17.8126 10.4227 17.8126 8.48438C17.8126 5.27344 15.211 2.67188 12.0001 2.67188C8.78912 2.67188 6.18756 5.27344 6.18756 8.48438C6.18756 10.4227 7.13678 12.1406 8.59693 13.1977C8.58756 13.2023 8.57818 13.2047 8.56881 13.2094C7.51881 13.6523 6.57662 14.2875 5.76803 15.0984C4.96344 15.9013 4.32194 16.8524 3.87896 17.8992C3.44378 18.924 3.20908 20.0228 3.18756 21.1359C3.18693 21.161 3.19132 21.1858 3.20046 21.2091C3.20961 21.2324 3.22332 21.2537 3.24079 21.2716C3.25826 21.2895 3.27915 21.3037 3.30221 21.3134C3.32527 21.3231 3.35004 21.3281 3.37506 21.3281H4.78131C4.88443 21.3281 4.96646 21.2461 4.96881 21.1453C5.01568 19.3359 5.74225 17.6414 7.02662 16.357C8.35553 15.0281 10.1204 14.2969 12.0001 14.2969C13.8797 14.2969 15.6446 15.0281 16.9735 16.357C18.2579 17.6414 18.9844 19.3359 19.0313 21.1453C19.0337 21.2484 19.1157 21.3281 19.2188 21.3281H20.6251C20.6501 21.3281 20.6749 21.3231 20.6979 21.3134C20.721 21.3037 20.7419 21.2895 20.7593 21.2716C20.7768 21.2537 20.7905 21.2324 20.7997 21.2091C20.8088 21.1858 20.8132 21.161 20.8126 21.1359C20.7891 20.0156 20.5571 18.9258 20.1212 17.8969ZM12.0001 12.5156C10.9243 12.5156 9.91178 12.0961 9.15006 11.3344C8.38834 10.5727 7.96881 9.56016 7.96881 8.48438C7.96881 7.40859 8.38834 6.39609 9.15006 5.63437C9.91178 4.87266 10.9243 4.45312 12.0001 4.45312C13.0758 4.45312 14.0883 4.87266 14.8501 5.63437C15.6118 6.39609 16.0313 7.40859 16.0313 8.48438C16.0313 9.56016 15.6118 10.5727 14.8501 11.3344C14.0883 12.0961 13.0758 12.5156 12.0001 12.5156Z"
                    fill="black"
                  />
                </svg>
              </div>
              <span
                class="text-green-900 text-sm md:text-lg font-medium font-roboto whitespace-nowrap"
              >
                김철수
              </span>
            </div>
            <!-- Notification Bell Icon -->
            <button class="relative" @click="handleNavigation('notification')">
              <!-- 종 아이콘 -->
              <svg
                class="w-6 h-6 sm:w-7 sm:h-7 text-green-900 hover:text-brand-1 transition-colors"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 17h5l-1.405-1.405C18.21 14.79 18 13.918 18 13V9c0-3.314-2.686-6-6-6S6 5.686 6 9v4c0 .918-.21 1.79-.595 2.595L4 17h5m6 0a3 3 0 01-6 0m6 0H9"
                />
              </svg>

              <!-- 숫자 뱃지 -->
              <span
                v-if="store.unreadCount > 0"
                class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] text-xs bg-red-500 text-white rounded-full flex items-center justify-center px-1"
              >
                {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
              </span>
            </button>
            <button
              @click="handleLogout"
              class="px-3 py-1.5 md:px-4 md:py-2 text-brand-1 text-sm md:text-base font-semibold font-inter border border-brand-2 rounded-lg hover:bg-brand-2 hover:text-white transition-colors whitespace-nowrap"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Header -->
    <div class="lg:hidden w-full bg-white px-4 py-3">
      <!-- Top Row: Logo, Search, User Profile, and Hamburger -->
      <div class="flex items-center justify-between mb-3">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <img
            class="w-24 h-9 sm:w-28 sm:h-10 md:w-32 md:h-12 object-contain cursor-pointer"
            src="@/assets/logo.png"
            alt="Logo"
            @click="handleLogoClick"
          />
        </div>

        <!-- Search Bar -->
        <div class="flex-1 mx-2 sm:mx-3 min-w-0">
          <div class="relative">
            <div class="flex items-center bg-zinc-100 rounded-lg px-2 sm:px-3 py-2">
              <i class="fas fa-search text-neutral-600 text-sm mr-1 sm:mr-2 flex-shrink-0"></i>
              <input
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                @input="handleSearchInput"
                type="text"
                placeholder="지역, 매물명, 지하철역으로 검색"
                class="flex-1 bg-transparent text-text-1 text-sm font-normal font-inter placeholder-text-1 outline-none ml-1 sm:ml-2 min-w-0"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- User Profile and Logout -->
        <div class="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2">
          <div class="flex items-center gap-1">
            <div
              class="w-6 h-6 sm:w-7 sm:h-7 bg-brand-3 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-4 h-4 sm:w-4 sm:h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.1212 17.8969C19.679 16.8496 19.0374 15.8984 18.2321 15.0961C17.4292 14.2915 16.4781 13.65 15.4313 13.207C15.4219 13.2023 15.4126 13.2 15.4032 13.1953C16.8633 12.1406 17.8126 10.4227 17.8126 8.48438C17.8126 5.27344 15.211 2.67188 12.0001 2.67188C8.78912 2.67188 6.18756 5.27344 6.18756 8.48438C6.18756 10.4227 7.13678 12.1406 8.59693 13.1977C8.58756 13.2023 8.57818 13.2047 8.56881 13.2094C7.51881 13.6523 6.57662 14.2875 5.76803 15.0984C4.96344 15.9013 4.32194 16.8524 3.87896 17.8992C3.44378 18.924 3.20908 20.0228 3.18756 21.1359C3.18693 21.161 3.19132 21.1858 3.20046 21.2091C3.20961 21.2324 3.22332 21.2537 3.24079 21.2716C3.25826 21.2895 3.27915 21.3037 3.30221 21.3134C3.32527 21.3231 3.35004 21.3281 3.37506 21.3281H4.78131C4.88443 21.3281 4.96646 21.2461 4.96881 21.1453C5.01568 19.3359 5.74225 17.6414 7.02662 16.357C8.35553 15.0281 10.1204 14.2969 12.0001 14.2969C13.8797 14.2969 15.6446 15.0281 16.9735 16.357C18.2579 17.6414 18.9844 19.3359 19.0313 21.1453C19.0337 21.2484 19.1157 21.3281 19.2188 21.3281H20.6251C20.6501 21.3281 20.6749 21.3231 20.6979 21.3134C20.721 21.3037 20.7419 21.2895 20.7593 21.2716C20.7768 21.2537 20.7905 21.2324 20.7997 21.2091C20.8088 21.1858 20.8132 21.161 20.8126 21.1359C20.7891 20.0156 20.5571 18.9258 20.1212 17.8969ZM12.0001 12.5156C10.9243 12.5156 9.91178 12.0961 9.15006 11.3344C8.38834 10.5727 7.96881 9.56016 7.96881 8.48438C7.96881 7.40859 8.38834 6.39609 9.15006 5.63437C9.91178 4.87266 10.9243 4.45312 12.0001 4.45312C13.0758 4.45312 14.0883 4.87266 14.8501 5.63437C15.6118 6.39609 16.0313 7.40859 16.0313 8.48438C16.0313 9.56016 15.6118 10.5727 14.8501 11.3344C14.0883 12.0961 13.0758 12.5156 12.0001 12.5156Z"
                  fill="black"
                />
              </svg>
            </div>
            <span
              class="text-green-900 text-xs font-medium font-roboto whitespace-nowrap flex-shrink-0"
            >
              김철수
            </span>
          </div>
          <!-- Notification Bell Icon -->
          <button
            @click="handleNavigation('notification')"
            class="relative text-green-900 hover:text-brand-1 transition-colors"
          >
            <!-- 종 아이콘 -->
            <svg
              class="w-6 h-6 md:w-7 md:h-7"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 17h5l-1.405-1.405C18.21 14.79 18 13.918 18 13V9c0-3.314-2.686-6-6-6S6 5.686 6 9v4c0 .918-.21 1.79-.595 2.595L4 17h5m6 0a3 3 0 01-6 0m6 0H9"
              />
            </svg>

            <!-- 🔴 숫자 뱃지 -->
            <span
              v-if="store.unreadCount > 0"
              class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] text-xs bg-red-500 text-white rounded-full flex items-center justify-center px-1"
            >
              {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
            </span>
          </button>
          <button
            @click="handleLogout"
            class="text-brand-1 text-xs font-semibold font-inter border border-brand-2 rounded px-2 py-1 sm:px-3 sm:py-1.5 hover:bg-brand-2 hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
          >
            로그아웃
          </button>
        </div>

        <!-- Hamburger Menu Button -->
        <button
          @click="toggleSidebar"
          class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-green-900 hover:text-brand-1 transition-colors"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Sidebar Component -->
    <Sidebar
      :is-open="isSidebarOpen"
      type="A"
      :custom-menu-items="sidebarMenuItems"
      @close="closeSidebar"
      @menu-click="handleSidebarMenuClick"
    />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import { useNotificationStore } from '@/stores/notification/notification'

import { onMounted } from 'vue'
import { listenForegroundMessage } from '@/utils/fcm'

// 알림 스토어 인스턴스 가져오기
const store = useNotificationStore()

// 메인페이지 관련 로직

onMounted(() => {
  // 스토어에서 더미데이터 가져옴 -> ☆나중에 실제 API로 대체 예정☆
  store.loadDummyNotifications()
  /**
   * fcm.js의 listenForegroundMessage() 호출
   * -> 즉, 이 시점부터는 앱이 켜져있는 동안 FCM이
   *    보내는 모든 알림을 수신함.
   * 알림 수신되면 내부의 onMessage()가 호출됨
   */
  listenForegroundMessage()
})

const router = useRouter()

// Reactive data
const searchQuery = ref('')
const searchInputRef = ref(null)
const isSidebarOpen = ref(false)

// Sidebar menu items
const sidebarMenuItems = [
  { id: 'map', label: '지도', action: 'navigate' },
  { id: 'chat', label: '채팅', action: 'navigate' },
  { id: 'trade', label: '거래', action: 'navigate' },
  { id: 'mypage', label: '마이페이지', action: 'navigate' },
]

// Methods
const handleLogout = () => {
  console.log('로그아웃 처리')
}

const handleLogoClick = () => {
  router.push('/main')
}

const handleNavigation = (route) => {
  console.log(`네비게이션: ${route}`)

  switch (route) {
    case 'map':
      router.push('/map')
      break
    case 'chat':
      router.push('/chat/list')
      break
    case 'notification':
      router.push('/notification')
      break
    case 'trade':
      router.push('/deal/waitinglist')
      break
    case 'mypage':
      router.push('/mypage')
      break
    default:
      console.log('알 수 없는 라우트:', route)
  }
}

// Sidebar methods
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleSidebarMenuClick = (item) => {
  console.log('사이드바 메뉴 클릭:', item)
  handleNavigation(item.id)
  closeSidebar()
}

// Search methods
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('검색 실행:', searchQuery.value)
  }
}

const handleSearchInput = () => {
  console.log('검색 입력:', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  console.log('검색어 초기화')
}
</script>

<style scoped>
/* Font family utilities */
.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.font-inter {
  font-family: 'Inter', sans-serif;
}

/* Search input focus effect */
input:focus {
  outline: 2px solid #68a63c;
  outline-offset: 2px;
}
</style>
