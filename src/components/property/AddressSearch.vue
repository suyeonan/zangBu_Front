<script setup>
import { ref } from 'vue'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },

  label: {
    type: String,
    default: '도로명 주소',
  },
  placeholder: {
    type: String,
    default: '예) 서울시 강남구 테헤란로 123',
  },
  buttonText: {
    type: String,
    default: '주소 검색',
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'address-selected'])

const isLoading = ref(false)

// 다음 우편번호 API 호출
const openPostcode = () => {
  if (isLoading.value) return

  isLoading.value = true

  new window.daum.Postcode({
    oncomplete: function (data) {
      console.log('🏠 주소 검색 완료:', data)

      // 주소 정보 구성
      const addressData = {
        roadAddress: data.roadAddress,
        jibunAddress: data.jibunAddress,
        buildingName: data.buildingName || '',
        apartment: data.apartment || 'N',
        zonecode: data.zonecode,
        sido: data.sido,
        sigungu: data.sigungu,
        siCode: data.siCode,
        eupmyeondong: data.eupmyeondong,
        bname: data.bname,
      }

      // 부모 컴포넌트에 주소 정보 전달
      emit('update:modelValue', data.roadAddress)
      emit('address-selected', addressData)

      isLoading.value = false
    },
    onclose: function () {
      isLoading.value = false
    },
  }).open()
}

// 입력 필드 클릭 시에도 주소 검색
const handleInputClick = () => {
  openPostcode()
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-text-2 mb-3">
      {{ label }}
    </label>
    <div class="flex space-x-2">
      <Input
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        @click="handleInputClick"
        :placeholder="placeholder"
        class="flex-1 cursor-pointer"
        readonly
      />
      <Button
        variant="button2"
        @click="openPostcode"
        :disabled="isLoading"
        class="!w-24 !py-3 !text-sm"
      >
        <template v-if="isLoading">
          <i class="fa-solid fa-spinner fa-spin mr-1"></i>
          검색중
        </template>
        <template v-else>
          {{ buttonText }}
        </template>
      </Button>
    </div>
  </div>
</template>
