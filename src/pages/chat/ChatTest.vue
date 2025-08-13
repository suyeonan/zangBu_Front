<!-- src/pages/StompTest.vue -->
<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { useStomp } from '@/utils/useStomp'
import { useAuthStore } from '@/stores/auth/auth'

const {
  connect,
  disconnect,
  subscribeRoom,
  unsubscribeRoom,
  unsubscribeAll,
  sendToRoom,
  connected, // useStomp가 ref로 제공
  activeRooms, // ref
} = useStomp()

const auth = useAuthStore()

const isConnecting = ref(false)
const jwtInput = ref('')
const roomIdInput = ref('')
const sendRoomId = ref('')
const message = ref('')
const logs = ref([])

const logArea = ref(null)
const statusText = computed(() =>
  connected.value ? 'CONNECTED' : isConnecting.value ? 'CONNECTING...' : 'DISCONNECTED'
)

function appendLog(msg) {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
  nextTick(() => {
    if (logArea.value) {
      logArea.value.scrollTop = logArea.value.scrollHeight
    }
  })
}

function onConnect() {
  if (connected.value) return
  const token = jwtInput.value?.trim()
  if (!token) return alert('JWT 토큰을 입력하세요 (Bearer 제외)')

  try {
    if (typeof auth.setAccessToken === 'function') auth.setAccessToken(token)
    else auth.accessToken = token
  } catch {
    auth.accessToken = token
  }

  isConnecting.value = true
  connect(() => {
    isConnecting.value = false
    appendLog('CONNECTED')
  })
}

function onDisconnect() {
  unsubscribeAll(true)
  disconnect()
  isConnecting.value = false
  appendLog('Disconnected')
}

function onAddSubscribe() {
  if (!connected.value) return alert('먼저 Connect')
  const r = roomIdInput.value
  if (!r) return alert('roomId 입력')

  subscribeRoom(r, (payload) => {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload)
    appendLog(`MESSAGE ${r}: ${body}`)
  })
  appendLog('SUBSCRIBE ' + r)
  roomIdInput.value = ''
}

function onUnsubOne(roomId) {
  unsubscribeRoom(roomId)
  appendLog('UNSUBSCRIBE ' + roomId)
}

function onUnsubAll() {
  unsubscribeAll(false)
  appendLog('UNSUBSCRIBE ALL')
}

function onSend() {
  if (!connected.value) return alert('먼저 Connect')
  const r = sendRoomId.value
  const m = message.value
  if (!r) return alert('roomId 입력')
  sendToRoom(r, { message: m })
  appendLog(`SEND /app/chat.send/${r} : ${m}`)
  message.value = ''
}

onBeforeUnmount(() => {
  unsubscribeAll(true) // 자동 재구독 의도까지 제거
  disconnect()
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 space-y-4">
    <h2 class="text-xl font-semibold">STOMP WebSocket Test (useStomp.js / 멀티 구독)</h2>

    <!-- JWT 수동 입력 -->
    <div class="flex items-center gap-2">
      <input
        v-model.trim="jwtInput"
        placeholder="JWT 액세스 토큰 입력 (Bearer 제외)"
        class="flex-1 px-3 py-2 rounded border"
      />
      <span class="text-gray-500 text-sm">JWT</span>
    </div>

    <div class="flex items-center gap-2">
      <!-- ★ FIX: 주석은 태그 밖에 -->
      <button
        class="px-3 py-2 rounded border"
        @click="onConnect"
        :disabled="isConnecting || connected"
      >
        Connect
      </button>
      <button class="px-3 py-2 rounded border" @click="onDisconnect" :disabled="!connected">
        Disconnect
      </button>
      <span class="text-gray-600 ml-2">
        {{ statusText }}
      </span>
    </div>

    <hr />

    <section class="space-y-2">
      <h3 class="font-semibold">Subscribe (채팅방 전용)</h3>
      <div class="flex gap-2">
        <input
          v-model.trim="roomIdInput"
          placeholder="예: room-123"
          class="flex-1 px-3 py-2 rounded border"
        />
        <!-- ★ FIX: 주석은 버튼 태그 바깥 -->
        <button class="px-3 py-2 rounded border" @click="onAddSubscribe" :disabled="!connected">
          Add Subscribe
        </button>
        <button class="px-3 py-2 rounded border" @click="onUnsubAll" :disabled="!connected">
          Unsubscribe All
        </button>
      </div>

      <div class="text-gray-600">
        <template v-if="activeRooms.length">
          <!-- ★ FIX: 이 위치의 주석은 OK -->
          <span
            v-for="r in activeRooms"
            :key="r"
            class="inline-flex items-center gap-2 px-3 py-1 border rounded-full mr-2 mb-2"
          >
            <code class="bg-gray-100 px-2 py-0.5 rounded">{{ r }}</code>
            <button class="px-2 py-0.5 border rounded" @click="onUnsubOne(r)">Unsub</button>
          </span>
        </template>
        <template v-else>현재 구독 없음</template>
      </div>
    </section>

    <section class="space-y-2">
      <h3 class="font-semibold">Logs</h3>
      <textarea
        ref="logArea"
        class="w-full h-48 border rounded p-2 font-mono text-sm"
        readonly
        :value="logs.join('\n')"
      />
    </section>

    <section class="space-y-2">
      <h3 class="font-semibold">Send</h3>
      <div class="flex gap-2">
        <input
          v-model.trim="sendRoomId"
          placeholder="방 ID (예: room-123)"
          class="px-3 py-2 rounded border"
        />
        <input
          v-model.trim="message"
          placeholder="메시지"
          class="flex-1 px-3 py-2 rounded border"
          @keyup.enter="onSend"
        />
        <!-- ★ FIX: 주석은 바깥 -->
        <button class="px-3 py-2 rounded border" @click="onSend" :disabled="!connected">
          Send
        </button>
      </div>
    </section>
  </div>
</template>
