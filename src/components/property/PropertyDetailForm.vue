<script setup>
import { ref, watch, computed } from 'vue'
import Input from '@/components/common/Input.vue'

// Props 정의
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      title: '',
      features: '',
      description: '',
      images: [],
    }),
  },
})

// Emits 정의
const emit = defineEmits(['update:modelValue'])

// 폼 데이터
const formData = ref({
  title: props.modelValue.title || '',
  features: props.modelValue.features || '',
  description: props.modelValue.description || '',
  images: props.modelValue.images || [],
})

// props 변경 감지
watch(
  () => props.modelValue,
  (newValue) => {
    formData.value = {
      title: newValue.title || '',
      features: newValue.features || '',
      description: newValue.description || '',
      images: newValue.images || [],
    }
  },
  { deep: true }
)

// 매물 설명 유효성 검사
const descriptionError = computed(() => {
  if (!formData.value.description) return ''
  if (formData.value.description.length < 50) {
    return `최소 50자 이상 입력해주세요. (현재 ${formData.value.description.length}자)`
  }
  return ''
})

// 데이터 변경 시 부모에게 전달
const updateFormData = (field, value) => {
  formData.value[field] = value
  emit('update:modelValue', { ...formData.value })
}

// 이미지 업로드 처리
const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)

  // 현재 이미지 개수 + 새로 선택한 이미지 개수 확인
  if (formData.value.images.length + files.length > 5) {
    alert('최대 5장까지만 업로드 가능합니다.')
    event.target.value = '' // input 초기화
    return
  }

  // 파일 크기 검사 (5MB)
  const validFiles = files.filter((file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name}은 5MB를 초과합니다.`)
      return false
    }
    return true
  })

  const newImages = [...formData.value.images, ...validFiles]
  updateFormData('images', newImages)

  // input 초기화 (같은 파일을 다시 선택할 수 있도록)
  event.target.value = ''
}

// 이미지 URL 생성 (메모리 누수 방지)
const getImageUrl = (image) => {
  if (typeof image === 'string') {
    return image
  }
  return URL.createObjectURL(image)
}

// 이미지 제거
const removeImage = (index) => {
  const imageToRemove = formData.value.images[index]

  // File 객체인 경우 URL 해제
  if (typeof imageToRemove !== 'string') {
    URL.revokeObjectURL(URL.createObjectURL(imageToRemove))
  }

  const newImages = [...formData.value.images]
  newImages.splice(index, 1)
  updateFormData('images', newImages)
}

// 이미지 로드 에러 처리
const handleImageError = (event) => {
  console.error('이미지 로드 실패:', event.target.src)
  event.target.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyngCDroZzrk5zsl6TrpZA8L3RleHQ+PC9zdmc+'
}
</script>

<template>
  <div class="space-y-8">
    <!-- 제목 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-3">제목</label>
      <Input
        :model-value="formData.title"
        @update:model-value="updateFormData('title', $event)"
        placeholder="예) 강남역 초역세권 신축 아파트, 빠른 입주 가능!"
      />
    </div>

    <!-- 매물 특징 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-3">매물 특징</label>
      <Input
        :model-value="formData.features"
        @update:model-value="updateFormData('features', $event)"
        placeholder="예) 강남역 초역세권 신축 아파트"
      />
    </div>

    <!-- 자세한 매물 설명 -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <label class="block text-sm font-medium text-text-2">자세한 매물 설명</label>
        <span class="text-sm text-text-1"> {{ formData.description.length }}/50자 (최소) </span>
      </div>
      <textarea
        :value="formData.description"
        @input="updateFormData('description', $event.target.value)"
        rows="6"
        :class="[
          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-3 focus:border-brand-3 resize-none text-text-2 placeholder:text-text-1',
          descriptionError ? 'border-status-2' : 'border-bg-1',
        ]"
        placeholder="매물의 장점, 주변 환경, 교통 정보를 상세히 기재해주세요. (최소 50자)"
      ></textarea>

      <!-- 에러 메시지 -->
      <p v-if="descriptionError" class="text-status-2 text-sm mt-2">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>
        {{ descriptionError }}
      </p>

      <!-- 도움말 -->
      <p
        v-else-if="formData.description.length > 0 && formData.description.length < 50"
        class="text-text-1 text-sm mt-2"
      >
        <i class="fa-solid fa-info-circle mr-1"></i>
        {{ 50 - formData.description.length }}자 더 입력해주세요.
      </p>
    </div>

    <!-- 매물 사진 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-3">매물 사진</label>
      <div class="border-2 border-dashed border-bg-1 rounded-lg p-8 text-center">
        <i class="fa-solid fa-camera text-3xl text-text-1 mb-4"></i>
        <p class="text-text-2 mb-2">사진을 드래그 앤 드롭하거나 클릭하여 업로드</p>
        <input
          type="file"
          multiple
          accept="image/*"
          @change="handleImageUpload"
          class="hidden"
          id="image-upload"
        />
        <label
          for="image-upload"
          class="inline-block px-4 py-2 bg-brand-3 text-text-3 rounded-lg cursor-pointer hover:bg-brand-2 transition-colors"
        >
          사진 선택
        </label>
        <p class="text-sm text-text-1 mt-2">최대 5장, 각 파일 5MB 이하 (JPG, PNG)</p>
      </div>

      <!-- 업로드된 이미지 미리보기 -->
      <div v-if="formData.images.length > 0" class="mt-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-medium text-text-2">
            업로드된 사진 ({{ formData.images.length }}/5장)
          </h4>
          <p class="text-xs text-text-1">사진을 클릭하면 삭제할 수 있습니다</p>
        </div>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="(image, index) in formData.images"
            :key="index"
            class="relative group cursor-pointer"
          >
            <div
              class="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-brand-3 transition-colors"
            >
              <img
                :src="getImageUrl(image)"
                :alt="`매물 사진 ${index + 1}`"
                class="w-full h-32 object-cover transition-transform group-hover:scale-105"
                @error="handleImageError"
              />

              <!-- 삭제 버튼 -->
              <button
                @click="removeImage(index)"
                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                title="사진 삭제"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>

              <!-- 이미지 순서 표시 -->
              <div
                class="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded"
              >
                {{ index + 1 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
