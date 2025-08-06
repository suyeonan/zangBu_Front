<script setup>
import PropertyCardMain from '@/components/common/PropertyCardMain.vue'
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
</script>
<template>
  <section class="py-8">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ title }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PropertyCardMain
          v-for="property in localProperties"
          :key="property.buildingId"
          :property="property"
          @bookmark="handleBookmark"
          @click="handleCardClick"
        />
      </div>
    </div>
  </section>
</template>
