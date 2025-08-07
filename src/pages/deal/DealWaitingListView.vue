<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDeals } from '@/api/deal/deal.js'
import PropertyCardWaiting from '@/components/common/PropertyCardWaiting.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()

// Reactive data
const deals = ref([])
const loading = ref(false)
const error = ref(null)
const activeFilter = ref('buying') // 기본값을 '구매 중'으로 설정

// Dummy data for testing - 실제 API 구조에 맞춤 (카멜케이스)
const dummyDeals = [
  {
    buildingId: '1',
    price: '750000000',
    buildingName: '스카이빌',
    houseType: '아파트',
    saleType: '매매',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    address: '서울시 광진구 자양로 21길 16-26',
    dealStatus: '구매중',
    createdAt: '2024-01-15',
  },
  {
    buildingId: '2',
    price: '520000000',
    buildingName: '한강하이츠',
    houseType: '오피스텔',
    saleType: '전세',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    address: '서울시 마포구 합정동 123-45',
    dealStatus: '판매중',
    createdAt: '2024-01-14',
  },
  {
    buildingId: '3',
    price: '980000000',
    buildingName: '롯데캐슬',
    houseType: '아파트',
    saleType: '매매',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    address: '서울시 송파구 잠실로 222',
    dealStatus: '판매중',
    createdAt: '2024-01-13',
  },
  {
    buildingId: '4',
    price: '130000000',
    buildingName: '행복한빌라',
    houseType: '빌라',
    saleType: '월세',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
    address: '경기도 성남시 분당구 수내동 88-1',
    dealStatus: '구매중',
    createdAt: '2024-01-12',
  },
  {
    buildingId: '5',
    price: '1200000000',
    buildingName: '강남아이파크',
    houseType: '아파트',
    saleType: '매매',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    address: '서울시 강남구 테헤란로 123',
    dealStatus: '판매중',
    createdAt: '2024-01-11',
  },
  {
    buildingId: '6',
    price: '850000000',
    buildingName: '마포래미안',
    houseType: '아파트',
    saleType: '매매',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    address: '서울시 마포구 월드컵로 123',
    dealStatus: '구매중',
    createdAt: '2024-01-10',
  },
  {
    buildingId: '7',
    price: '650000000',
    buildingName: '잠실엘스',
    houseType: '아파트',
    saleType: '전세',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    address: '서울시 송파구 잠실동 123',
    dealStatus: '판매중',
    createdAt: '2024-01-09',
  },
  {
    buildingId: '8',
    price: '450000000',
    buildingName: '목동한강',
    houseType: '오피스텔',
    saleType: '월세',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    address: '서울시 양천구 목동 456',
    dealStatus: '구매중',
    createdAt: '2024-01-08',
  },
]

// Fetch deals from API (now using dummy data)
const fetchDeals = async () => {
  loading.value = true
  error.value = null

  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Use dummy data instead of API call
    deals.value = dummyDeals

    // Uncomment below to use real API
    // const response = await getDeals()
    // deals.value = response.data?.deals || []
  } catch (err) {
    console.error('Failed to fetch deals:', err)
    error.value = '거래 목록을 불러오는데 실패했습니다. 다시 시도해주세요.'
  } finally {
    loading.value = false
  }
}

// Filter deals based on active filter
const filteredDeals = computed(() => {
  if (activeFilter.value === 'all') {
    return deals.value
  } else if (activeFilter.value === 'buying') {
    return deals.value.filter((deal) => deal.dealStatus === '구매중')
  } else if (activeFilter.value === 'selling') {
    return deals.value.filter((deal) => deal.dealStatus === '판매중')
  }
  return deals.value
})

// Set active filter
const setActiveFilter = (filter) => {
  activeFilter.value = filter
}

// Format deal data for PropertyCard component
const formatDealForPropertyCard = (deal) => {
  return {
    buildingId: deal.buildingId,
    buildingName: deal.buildingName,
    address: deal.address,
    imageUrl: deal.imageUrl || '/default-property.jpg',
    price: deal.price,
    dealStatus: deal.dealStatus,
    createdAt: deal.createdAt,
    saleType: deal.saleType,
    houseType: deal.houseType,
    // 거래 관련 추가 정보
    deal_id: deal.buildingId,
    user_role: deal.dealStatus === '구매중' ? 'buyer' : 'seller',
  }
}

// Handle deal detail
const handleDealDetail = (property) => {
  const dealId = property.deal_id
  if (property.user_role === 'seller') {
    router.push(`/deal/seller/${dealId}`)
  } else {
    router.push(`/deal/buyer/${dealId}`)
  }
}

// Initialize component
onMounted(() => {
  fetchDeals()
})
</script>

<template>
  <div class="deal-waiting-list-view">
    <!-- Main Content -->
    <div class="main-content">
      <!-- Section Title -->
      <div class="section-title">
        <h1>거래 중인 매물</h1>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <Button
          :variant="activeFilter === 'all' ? 'button1' : 'button10'"
          size="sm"
          @click="setActiveFilter('all')"
        >
          전체
        </Button>
        <Button
          :variant="activeFilter === 'buying' ? 'button1' : 'button10'"
          size="sm"
          @click="setActiveFilter('buying')"
        >
          구매 중
        </Button>
        <Button
          :variant="activeFilter === 'selling' ? 'button1' : 'button10'"
          size="sm"
          @click="setActiveFilter('selling')"
        >
          판매 중
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">거래 목록을 불러오는 중...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <i class="fas fa-exclamation-triangle error-icon"></i>
        <p class="error-text">{{ error }}</p>
        <Button variant="button1" @click="fetchDeals" icon="fas fa-redo"> 다시 시도 </Button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredDeals.length === 0" class="empty-container">
        <i class="fas fa-inbox empty-icon"></i>
        <h3 class="empty-title">거래 중인 매물이 없습니다</h3>
        <p class="empty-text">새로운 거래가 등록되면 여기에 표시됩니다.</p>
      </div>

      <!-- Deals List -->
      <div v-else class="deals-container">
        <div
          class="deals-grid"
          :class="{
            'deals-grid-one': filteredDeals.length === 1,
            'deals-grid-two': filteredDeals.length === 2,
          }"
        >
          <PropertyCardWaiting
            v-for="deal in filteredDeals"
            :key="deal.buildingId"
            :property="formatDealForPropertyCard(deal)"
            @detail="handleDealDetail"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deal-waiting-list-view {
  min-height: 100vh;
  background: var(--bg-1);
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 1.25rem;
  max-width: 75rem;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 12.5rem); /* Header + Footer 높이 고려 */
  overflow-y: auto;
  background: var(--bg-1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Section Title */
.section-title {
  text-align: left;
  margin-bottom: 2rem;
  padding-left: 1.25rem;
  max-width: 100%;
  width: 100%;
  align-self: flex-start;
}

.section-title h1 {
  color: #374151;
  font-size: 1.75rem;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  margin: 0;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  justify-content: flex-start;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  padding-left: 1.25rem;
  max-width: 100%;
  width: 100%;
  align-self: flex-start;
  flex-wrap: wrap;
}

.filter-tabs :deep(button) {
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-tabs :deep(button:hover) {
  transform: translateY(-1px);
}

/* Deals Container */
.deals-container {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  max-width: 100%;
  align-self: stretch;
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 75rem;
  justify-items: start;
  transition: all 0.3s ease;
}

.deals-grid-one {
  grid-template-columns: 1fr;
  justify-items: start;
}

.deals-grid-two {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 640px) {
  .deals-grid-two {
    grid-template-columns: 1fr;
  }
}

/* Card transition effects */
.deals-grid :deep(.property-card-waiting) {
  transition: all 0.3s ease;
}

.deals-grid :deep(.property-card-waiting:hover) {
  transform: translateY(-4px);
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.15);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.25rem;
  min-height: calc(100vh - 18.75rem);
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.25rem solid var(--bg-2);
  border-top: 0.25rem solid var(--brand-3);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--text-2);
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.25rem;
  text-align: center;
  min-height: calc(100vh - 18.75rem);
}

.error-icon {
  font-size: 3rem;
  color: var(--status-2);
  margin-bottom: 1rem;
}

.error-text {
  color: var(--text-2);
  font-size: 1rem;
  margin-bottom: 1.25rem;
  font-family: 'Roboto', sans-serif;
}

/* Empty State */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.25rem;
  text-align: center;
  min-height: calc(100vh - 18.75rem);
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-1);
  margin-bottom: 1rem;
}

.empty-title {
  color: var(--text-2);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: 'Roboto', sans-serif;
}

.empty-text {
  color: var(--text-1);
  font-size: 0.875rem;
  font-family: 'Roboto', sans-serif;
}

/* Mobile styles (768px 이하) */
@media (max-width: 48rem) {
  .main-content {
    padding: 1rem;
    min-height: calc(100vh - 11.25rem);
    margin: 0 auto;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    align-items: center;
  }

  .section-title {
    padding-left: 0;
    margin-bottom: 1.5rem;
    text-align: left;
    align-self: flex-start;
    width: 100%;
  }

  .section-title h1 {
    font-size: 1.5rem;
  }

  .filter-tabs {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    padding-left: 0;
    flex-wrap: wrap;
    margin-bottom: 2rem;
    justify-content: flex-start;
    align-self: flex-start;
    width: 100%;
  }

  .deals-container {
    width: 100%;
    padding: 0;
    align-self: stretch;
  }

  .deals-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    justify-items: center;
    width: 100%;
    padding: 0 0.5rem;
  }

  /* Custom button sizing for mobile */
  .filter-tabs :deep(button) {
    min-width: 3.75rem !important;
    height: 2rem !important;
    padding: 0.25rem 0.5rem !important;
    font-size: 0.75rem !important;
  }

  .loading-container,
  .error-container,
  .empty-container {
    min-height: calc(100vh - 15.625rem);
    padding: 2rem 1rem;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
  }

  .loading-text,
  .error-text {
    font-size: 0.875rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-title {
    font-size: 1.125rem;
  }

  .empty-text {
    font-size: 0.8125rem;
  }
}

/* Small Mobile styles (480px 이하) */
@media (max-width: 30rem) {
  .main-content {
    padding: 0.75rem;
  }

  .section-title {
    margin-bottom: 1.25rem;
  }

  .section-title h1 {
    font-size: 1.375rem;
  }

  .filter-tabs {
    gap: 0.375rem;
    margin-bottom: 1.5rem;
  }

  .deals-grid {
    gap: 1rem;
    padding: 0 0.25rem;
  }

  .filter-tabs :deep(button) {
    min-width: 3.25rem !important;
    height: 1.875rem !important;
    padding: 0.25rem 0.375rem !important;
    font-size: 0.6875rem !important;
  }
}

/* Tablet styles (769px - 1023px) */
@media (min-width: 48.0625rem) and (max-width: 64rem) {
  .main-content {
    padding: 1.25rem;
    min-height: calc(100vh - 12.5rem);
  }

  .deals-grid {
    grid-template-columns: repeat(auto-fit, minmax(18.75rem, 1fr));
    gap: 1.5rem;
    max-width: 100%;
  }

  .filter-tabs :deep(button) {
    min-width: 4.375rem !important;
    height: 2.25rem !important;
    padding: 0.375rem 0.75rem !important;
    font-size: 0.8125rem !important;
  }
}

/* Desktop styles (1024px 이상) */
@media (min-width: 64rem) {
  .main-content {
    padding: 1.25rem;
    min-height: calc(100vh - 12.5rem);
  }

  .section-title {
    padding-left: 1.25rem;
    margin-bottom: 2rem;
  }

  .section-title h1 {
    font-size: 1.75rem;
  }

  .filter-tabs {
    padding-left: 1.25rem;
    margin-bottom: 2.5rem;
  }

  .deals-grid {
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: 2rem;
    justify-items: center;
  }

  .filter-tabs :deep(button) {
    min-width: 5rem !important;
    height: 2.5rem !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem !important;
  }
}

/* Large Desktop styles (1440px 이상) */
@media (min-width: 90rem) {
  .main-content {
    padding: 1.5rem;
  }

  .deals-grid {
    grid-template-columns: repeat(auto-fit, minmax(21.875rem, 1fr));
    gap: 2.25rem;
  }
}

/* Extra Large Desktop styles (1920px 이상) */
@media (min-width: 120rem) {
  .main-content {
    padding: 2rem;
    max-width: 85rem;
  }

  .deals-grid {
    grid-template-columns: repeat(auto-fit, minmax(23.75rem, 1fr));
    gap: 2.5rem;
  }
}
</style>
