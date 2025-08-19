<template>
  <div
    class="flex items-start gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
    :class="notification.isRead ? 'opacity-50' : ''"
    @click="emit('open', notification)"
  >
    <NotificationIcon :type="notification.type" />

    <div class="flex-1">
      <NotificationCardHeader
        :title="notification.title"
        :message="notification.message"
        :is-read="notification.isRead"
      />
      <NotificationCardMeta
        :timestamp="notification.createdAt"
        :tag="notification.saleType ? `${notification.saleType} ${notification.price}억` : ''"
      />
    </div>

    <!-- 액션 클릭이 카드 클릭으로 버블되지 않게 래핑해서 stop -->
    <div class="flex-shrink-0" @click.stop>
      <NotificationCardActions
        :is-read="notification.isRead"
        @mark-read="emit('notification-action', { type: 'markRead', id: notification.id })"
        @delete="emit('notification-action', { type: 'delete', id: notification.id })"
      />
    </div>
  </div>
</template>

<script setup>
import NotificationIcon from './NotificationIcon.vue'
import NotificationCardHeader from './NotificationCardHeader.vue'
import NotificationCardMeta from './NotificationCardMeta.vue'
import NotificationCardActions from './NotificationCardActions.vue'

const props = defineProps({
  notification: { type: Object, required: true },
})

const emit = defineEmits(['open', 'notification-action'])
</script>
