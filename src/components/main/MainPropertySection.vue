<script setup>
import PropertyCardMain from '@/components/common/PropertyCardMain.vue'
import EmptyStateCard from '@/components/common/EmptyStateCard.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  properties: { type: Array, required: true },
})

// 라우터 초기화
const router = useRouter()

// 로컬 상태로 properties 관리
const localProperties = ref([...props.properties])

// 찜 기능 처리
const handleBookmark = (bookmarkData) => {
  console.log('Bookmark clicked:', bookmarkData)

  // 로컬 상태에서 해당 property의 isBookmarked 업데이트
  const propertyIndex = localProperties.value.findIndex(
    (prop) => prop.buildingId === bookmarkData.propertyId
  )

  if (propertyIndex !== -1) {
    localProperties.value[propertyIndex].isBookmarked = bookmarkData.isBookmarked
  }
}

// 카드 클릭 처리
const handleCardClick = (property) => {
  console.log('Card clicked:', property)

  // MapView로 이동하면서 매물 상세 정보 조회를 위한 파라미터 전달
  const queryParams = {
    buildingId: property.buildingId,
    searchGbn: '1',
    complexNo: property.complexNo || '', // property에 complexNo가 있다면 사용
    dong: '',
    ho: '',
  }

  console.log('Request body for MapView:', queryParams)

  router.push({
    path: '/map',
    query: queryParams,
  })
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-if="localProperties.length > 0">
          <PropertyCardMain
            v-for="property in localProperties"
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
