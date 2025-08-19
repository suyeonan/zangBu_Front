<script setup>
import PropertyCardMain from '@/components/common/PropertyCardMain.vue'
import EmptyStateCard from '@/components/common/EmptyStateCard.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/stores/main/main'

const props = defineProps({
  title: { type: String, required: true },
  properties: { type: Array, required: true },
})

// 라우터 초기화
const router = useRouter()

// 메인 스토어 사용
const mainStore = useMainStore()

// API 응답 구조에 맞게 데이터 변환
const processedProperties = computed(() => {
  console.log('MainPropertySection: props.properties:', props.properties)

  const processed = props.properties.map((item) => {
    console.log('Processing item:', item)

    // API 응답이 { building: { ... } } 형태인 경우
    if (item.building) {
      const result = {
        buildingId: item.building.buildingId,
        price: item.building.price,
        buildingName: item.building.buildingName,
        imageUrl: item.building.imageUrl,
        isBookmarked: item.building.isBookmarked,
        rank: item.building.rank,
        complexNo: item.building.complexNo,
      }
      console.log('Processed result:', result)
      return result
    }
    // 이미 올바른 형태인 경우 (현재 API 응답 형태)
    console.log('Item already in correct format:', item)
    return {
      buildingId: item.buildingId,
      price: item.price,
      buildingName: item.buildingName,
      imageUrl: item.imageUrl,
      isBookmarked: item.isBookmarked,
      rank: item.rank,
      complexNo: item.complexNo,
    }
  })

  console.log('Final processedProperties:', processed)
  return processed
})

// 찜 기능 처리
const handleBookmark = async (bookmarkData) => {
  console.log('Bookmark event received:', bookmarkData)

  // 스토어의 찜하기/찜해제 함수 호출
  const success = await mainStore.toggleBookmark(bookmarkData.propertyId)

  if (!success) {
    console.error('Failed to toggle bookmark')
  } else {
    console.log('Bookmark toggled successfully')
  }
}

// 카드 클릭 처리
const handleCardClick = (property) => {
  // MapView의 매물 상세 페이지로 직접 이동
  router.push(`/map/apt/${property.buildingId}`)
}

// 빈 상태 제목 반환
const getEmptyStateTitle = () => {
  switch (props.title) {
    case '리뷰 많은 매물':
      return '리뷰가 있는 매물이 없습니다'
    case '찜 많은 매물':
      return '찜한 매물이 없습니다'
    case '신규 매물':
      return '신규 매물이 없습니다'
    default:
      return '매물이 없습니다'
  }
}

// 빈 상태 설명 반환
const getEmptyStateDescription = () => {
  switch (props.title) {
    case '리뷰 많은 매물':
      return '아직 리뷰가 작성된 매물이 없습니다. 첫 번째 리뷰를 작성해보세요!'
    case '찜 많은 매물':
      return '아직 찜한 매물이 없습니다. 관심 있는 매물을 찜해보세요!'
    case '신규 매물':
      return '현재 등록된 신규 매물이 없습니다. 나중에 다시 확인해주세요.'
    default:
      return '현재 등록된 매물이 없습니다. 나중에 다시 확인해주세요.'
  }
}

// 아이콘 타입 반환
const getIconType = () => {
  switch (props.title) {
    case '리뷰 많은 매물':
      return 'review'
    case '찜 많은 매물':
      return 'like'
    case '신규 매물':
      return 'new'
    default:
      return 'default'
  }
}
</script>
<template>
  <section class="py-8">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ title }}</h2>
      <div
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 justify-items-center"
      >
        <template v-if="processedProperties.length > 0">
          <PropertyCardMain
            v-for="property in processedProperties"
            :key="property.buildingId"
            :property="property"
            @bookmark="handleBookmark"
            @click="handleCardClick"
          />
        </template>
        <template v-else>
          <div class="col-span-full">
            <EmptyStateCard
              :title="getEmptyStateTitle()"
              :description="getEmptyStateDescription()"
              :icon-type="getIconType()"
            />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 특정 구간에서의 카드 간격 최적화 */
@media (min-width: 768px) and (max-width: 1023px) {
  .grid {
    gap: 1.25rem; /* 더 작은 간격 적용 */
  }
}

@media (min-width: 800px) and (max-width: 860px) {
  .grid {
    gap: 1rem; /* 813-849px 구간에서 더욱 조밀한 간격 */
    padding: 0 0.5rem;
  }
}
</style>
