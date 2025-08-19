<template>
  <div class="flex border-b border-gray-200 text-sm text-gray-600">
    <div
      v-for="f in filters"
      :key="f.key"
      class="flex-1 text-center cursor-pointer py-3 border-b-2"
      :class="activeFilter === f.key ? 'border-black font-bold' : 'border-transparent'"
      @click="set(f.key)"
    >
      {{ f.label }}
      <!-- 읽지 않은 개수 -->
      <span v-if="unreadCounts[f.key] > 0"> ({{ unreadCounts[f.key] }}) </span>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notification/notification'

const store = useNotificationStore()
const { activeFilter, unreadCounts } = storeToRefs(store)
const filters = store.filters

function set(key) {
  store.setNotificationFilter(key)
}
</script>
