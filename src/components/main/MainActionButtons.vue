<script setup>
import Button from '@/components/common/Button.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSearchProperties = () => {
  console.log('매물 찾기 클릭')
  router.push('/map')
}

const handleUploadProperty = () => {
  console.log('매물 올리기 클릭')
  router.push('/property/register')
}
</script>
<template>
  <div class="flex justify-center gap-6 my-8">
    <Button
      variant="button4"
      class="!bg-brand-3 hover:!bg-brand-2 !w-80 !h-16 !text-lg !px-8 !py-4"
      @click="handleSearchProperties"
    >
      <i class="fas fa-search mr-3"></i>매물 찾기
    </Button>
    <Button
      variant="button4"
      class="!bg-brand-1 hover:!bg-brand-2 !w-80 !h-16 !text-lg !px-8 !py-4"
      @click="handleUploadProperty"
    >
      <i class="fas fa-plus mr-3"></i>매물 올리기
    </Button>
  </div>
</template>
