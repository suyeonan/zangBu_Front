<!-- /components/notification/NotificationCardMeta.vue -->
<template>
  <div class="text-xs text-gray-400 mt-1 flex items-center gap-2">
    <!-- 백엔드에서 받은 createdAt 문자열 그대로 출력 -->
    <div>{{ timestamp }}</div>

    <!-- 금액 표시 -->
    <div v-if="displayPrice !== null" class="text-gray-500">| {{ displayPrice }}원</div>

    <!-- 태그 배지 -->
    <NotificationBadge v-if="tag" :tag="tag" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NotificationBadge from './NotificationBadge.vue'

const props = defineProps({
  timestamp: { type: String, default: '' }, // "34분 전" 같은 문자열
  price: { type: [String, Number], default: null },
  tag: { type: String, default: '' },
})

function toNum(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const displayPrice = computed(() => {
  const n = toNum(props.price)
  return n === null ? null : n.toLocaleString('ko-KR')
})
</script>
