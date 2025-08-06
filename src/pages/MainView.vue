<script setup>
import MainHeroSection from '@/components/main/MainHeroSection.vue'
import MainActionButtons from '@/components/main/MainActionButtons.vue'
import MainPropertySection from '@/components/main/MainPropertySection.vue'
import { ref, onMounted } from 'vue'
import axios from '@/api/axios'

// 데이터 상태
const mostReviewedProperties = ref([])
const mostLikedProperties = ref([])
const newProperties = ref([])
const nickName = ref('')

// 메인 데이터 로드
const loadMainData = async () => {
  try {
    const response = await axios.get('/main')
    const data = response.data

    nickName.value = data.nickName
    mostReviewedProperties.value = data.topReviewed || []
    mostLikedProperties.value = data.topLiked || []
    newProperties.value = data.newRooms || []

    console.log('Main data loaded:', data)
  } catch (error) {
    console.error('Failed to load main data:', error)
    // 에러 시 기본 데이터 사용
    mostReviewedProperties.value = []
    mostLikedProperties.value = []
    newProperties.value = []
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadMainData()
})
</script>
<template>
  <div class="bg-white min-h-screen">
    <MainHeroSection />
    <MainActionButtons />
    <MainPropertySection title="리뷰 많은 매물" :properties="mostReviewedProperties" />
    <MainPropertySection title="찜 많은 매물" :properties="mostLikedProperties" />
    <MainPropertySection title="신규 매물" :properties="newProperties" />
  </div>
</template>
