<script setup>
import Button from '@/components/common/Button.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleSearchProperties = () => {
  console.log('매물 찾기 클릭')
  router.push('/map')
}

const handleUploadProperty = () => {
  console.log('매물 올리기 클릭')

  // 로그인 상태 확인
  if (!authStore.isAuthenticated) {
    console.log('로그인이 필요합니다. 로그인 페이지로 이동합니다.')
    router.push('/auth/login')
    return
  }

  // 로그인된 사용자는 매물 등록 페이지로 이동
  router.push('/property/register')
}
</script>
<template>
  <div class="flex justify-center gap-6 my-8">
    <Button
      variant="button4"
      class="!bg-brand-3 hover:!bg-brand-2 w-32 h-12 sm:w-48 sm:h-14 md:w-64 md:h-16 lg:w-80 lg:h-16 desktop:w-96 desktop:h-16 desktop:text-xl desktop:px-10 desktop:py-4"
      @click="handleSearchProperties"
    >
      <i class="fas fa-search mr-3"></i>매물 찾기
    </Button>
    <Button
      variant="button4"
      class="!bg-brand-1 hover:!bg-brand-2 w-32 h-12 sm:w-48 sm:h-14 md:w-64 md:h-16 lg:w-80 lg:h-16 desktop:w-96 desktop:h-16 desktop:text-xl desktop:px-10 desktop:py-4"
      @click="handleUploadProperty"
    >
      <i class="fas fa-plus mr-3"></i>매물 올리기
    </Button>
  </div>
</template>
