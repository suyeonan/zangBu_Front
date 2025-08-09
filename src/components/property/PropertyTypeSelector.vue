<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const options = [
  { value: 'sale', label: '매매' },
  { value: 'jeonse', label: '전세' },
  { value: 'monthly', label: '월세' },
]

const updateValue = (value) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="grid grid-cols-3 gap-1 sm:gap-2">
    <label
      v-for="option in options"
      :key="option.value"
      class="relative flex items-center justify-center p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md min-h-[50px] sm:min-h-[56px]"
      :class="
        modelValue === option.value
          ? 'border-brand-3 bg-brand-3 bg-opacity-10'
          : 'border-gray-200 hover:border-brand-3 hover:bg-gray-50'
      "
    >
      <input
        type="radio"
        name="propertyType"
        :value="option.value"
        :checked="modelValue === option.value"
        @change="updateValue(option.value)"
        class="sr-only"
      />
      <div
        class="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 border-2 rounded-full flex-shrink-0"
        :class="modelValue === option.value ? 'border-brand-3 bg-brand-3' : 'border-gray-300'"
      >
        <div
          v-if="modelValue === option.value"
          class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
        ></div>
      </div>
      <span class="text-xs sm:text-sm font-medium text-text-2 text-center leading-tight flex-1">
        {{ option.label }}
      </span>
    </label>
  </div>
</template>
