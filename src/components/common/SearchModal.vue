<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click="closeModal"
  >
    <div class="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold text-gray-900">검색</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
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

      <!-- Search Input -->
      <div class="p-4">
        <div class="relative">
          <div class="flex items-center bg-zinc-100 rounded-lg px-3 py-3">
            <i class="fas fa-search text-neutral-600 text-base mr-2"></i>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              @input="handleSearchInput"
              type="text"
              placeholder="지역, 매물명, 지하철역으로 검색"
              class="flex-1 bg-transparent text-text-1 text-base font-normal font-inter placeholder-text-1 outline-none"
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

      <!-- Search Results or Recent Searches -->
      <div class="px-4 pb-4">
        <div v-if="searchQuery && searchResults.length > 0" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700 mb-2">검색 결과</h4>
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            @click="selectResult(result)"
          >
            <div class="font-medium text-gray-900">{{ result.title }}</div>
            <div class="text-sm text-gray-600">{{ result.description }}</div>
          </div>
        </div>

        <div v-else-if="!searchQuery && recentSearches.length > 0" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700 mb-2">최근 검색</h4>
          <div
            v-for="search in recentSearches"
            :key="search"
            class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            @click="selectRecentSearch(search)"
          >
            <div class="flex items-center">
              <i class="fas fa-history text-gray-400 mr-2"></i>
              <span class="text-gray-900">{{ search }}</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <i class="fas fa-search text-4xl mb-4 text-gray-300"></i>
          <p>검색어를 입력해주세요</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'search'])

// Reactive data
const searchQuery = ref('')
const searchInputRef = ref(null)
const searchResults = ref([])
const recentSearches = ref(['강남구 아파트', '홍대역 근처', '신축 빌라'])

// Methods
const closeModal = () => {
  emit('close')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('검색 실행:', searchQuery.value)
    emit('search', searchQuery.value)

    // 최근 검색에 추가
    if (!recentSearches.value.includes(searchQuery.value)) {
      recentSearches.value.unshift(searchQuery.value)
      if (recentSearches.value.length > 5) {
        recentSearches.value.pop()
      }
    }

    closeModal()
  }
}

const handleSearchInput = () => {
  // 검색어 입력 시 검색 결과 시뮬레이션
  if (searchQuery.value.trim()) {
    searchResults.value = [
      {
        id: 1,
        title: `${searchQuery.value} 관련 매물`,
        description: '강남구, 신축, 3억 5천만원',
      },
      {
        id: 2,
        title: `${searchQuery.value} 근처 상가`,
        description: '서초구, 1층, 월세 200만원',
      },
    ]
  } else {
    searchResults.value = []
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const selectResult = (result) => {
  console.log('검색 결과 선택:', result)
  emit('search', result.title)
  closeModal()
}

const selectRecentSearch = (search) => {
  searchQuery.value = search
  handleSearch()
}

// Watch for modal open to focus input
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    } else {
      searchQuery.value = ''
      searchResults.value = []
    }
  }
)
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
