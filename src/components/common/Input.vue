<template>
  <div class="w-full">
    <input
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :readonly="readonly"
      :maxlength="maxlength"
      :minlength="minlength"
      :name="name"
      :id="id"
      class="w-full px-4 py-3 text-base leading-6 text-text-2 bg-bg-2 border border-bg-1 rounded-lg outline-none box-border placeholder:text-text-1 placeholder:text-base disabled:bg-bg-1 disabled:text-text-1 disabled:cursor-not-allowed disabled:opacity-60 focus:border-brand-3 focus:ring-1 focus:ring-brand-3 transition-colors"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
      @keypress="handleKeypress"
      @click="handleClick"
    />
  </div>
</template>

<script setup>
// Props 정의
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) =>
      ['text', 'email', 'password', 'number', 'tel', 'url', 'search'].includes(value),
  },
  placeholder: {
    type: String,
    default: '예: 김철수',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  maxlength: {
    type: Number,
    default: null,
  },
  minlength: {
    type: Number,
    default: null,
  },
  name: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
})

// Emits 정의
const emit = defineEmits([
  'update:modelValue',
  'input',
  'focus',
  'blur',
  'change',
  'keypress',
  'click',
])

// 메서드들
const handleInput = (event) => {
  let value = event.target.value

  // number 타입일 때 숫자만 허용
  if (props.type === 'number') {
    value = value.replace(/[^0-9]/g, '')
    event.target.value = value
  }

  // email 타입일 때 이메일 형식만 허용
  if (props.type === 'email') {
    // 이메일 형식: 영문자, 숫자, 특수문자(@, ., -, _)만 허용
    value = value.replace(/[^a-zA-Z0-9@._-]/g, '')
    event.target.value = value
  }

  emit('update:modelValue', value)
  emit('input', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleChange = (event) => {
  emit('change', event)
}

const handleKeypress = (event) => {
  emit('keypress', event)
}

const handleClick = (event) => {
  emit('click', event)
}
</script>
