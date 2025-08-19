<template>
  <div class="mt-4 space-y-3">
    <NotificationCard
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @open="$emit('open', $event)"
      @notification-action="$emit('notification-action', $event)"
    />

    <div v-if="loading" class="text-sm text-gray-500 text-center py-8">불러오는 중...</div>
  </div>
</template>

<script setup>
import NotificationCard from './NotificationCard.vue'

defineProps({
  notifications: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['open', 'notification-action'])
</script>
