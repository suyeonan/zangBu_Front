<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
    // options: [{ value: 'owner', label: '집주인', description: '선택적 설명' }]
  },
  name: {
    type: String,
    required: true,
  },
  columns: {
    type: [Number, String],
    default: 'auto',
  },
  size: {
    type: String,
    default: 'medium', // 'small' | 'medium' | 'large'
  },
})

const emit = defineEmits(['update:modelValue'])

const gridClass = computed(() => {
  if (typeof props.columns === 'number') {
    // 명시적으로 columns가 설정된 경우, 반응형 클래스 적용
    if (props.columns === 3) {
      return 'grid-cols-3' // 매물 종류는 항상 3열 유지
    }
    return `grid-cols-${props.columns}`
  }

  const optionCount = props.options.length
  if (optionCount <= 2) return 'grid-cols-1 sm:grid-cols-2'
  if (optionCount <= 3) return 'grid-cols-3' // 모든 화면에서 3열 유지 (매매, 전세, 월세)
  if (optionCount <= 4) return 'grid-cols-2 sm:grid-cols-4'
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
})

const sizeClasses = computed(() => {
  const sizes = {
    small: {
      container: 'p-3',
      radio: 'w-4 h-4',
      radioInner: 'w-1 h-1',
      text: 'text-xs sm:text-sm',
      margin: 'mr-2',
    },
    medium: {
      container: 'p-3 sm:p-4',
      radio: 'w-5 h-5 sm:w-6 sm:h-6',
      radioInner: 'w-1.5 h-1.5 sm:w-2 sm:h-2',
      text: 'text-xs sm:text-sm font-medium',
      margin: 'mr-2 sm:mr-3',
    },
    large: {
      container: 'p-4 sm:p-5',
      radio: 'w-6 h-6 sm:w-7 sm:h-7',
      radioInner: 'w-2 h-2 sm:w-2.5 sm:h-2.5',
      text: 'text-sm sm:text-lg font-medium',
      margin: 'mr-3 sm:mr-4',
    },
  }
  return sizes[props.size] || sizes.medium
})

const updateValue = (value) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="grid gap-4" :class="gridClass">
    <label
      v-for="option in options"
      :key="option.value"
      class="relative flex items-center border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
      :class="[
        sizeClasses.container,
        modelValue === option.value
          ? 'border-brand-3 bg-brand-3 bg-opacity-10'
          : 'border-gray-200 hover:border-brand-3 hover:bg-gray-50',
      ]"
    >
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        @change="updateValue(option.value)"
        class="sr-only"
      />
      <div
        class="flex items-center justify-center border-2 rounded-full"
        :class="[
          sizeClasses.radio,
          sizeClasses.margin,
          modelValue === option.value ? 'border-brand-3 bg-brand-3' : 'border-gray-300',
        ]"
      >
        <div
          v-if="modelValue === option.value"
          class="bg-white rounded-full"
          :class="sizeClasses.radioInner"
        ></div>
      </div>
      <div class="flex-1">
        <span class="text-text-2" :class="sizeClasses.text">{{ option.label }}</span>
        <p v-if="option.description" class="text-xs text-text-1 mt-1">
          {{ option.description }}
        </p>
      </div>
    </label>
  </div>
</template>
