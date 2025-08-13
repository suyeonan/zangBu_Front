<template>
  <div class="w-full max-w-screen-xl mx-auto">
    <div class="flex flex-col h-screen bg-gray-50">
      <!-- 헤더 -->
      <header class="bg-[var(--brand-3)] text-white flex items-center justify-between px-4 py-3">
        <!-- 좌측 영역 -->
        <div class="flex items-start gap-3">
          <button @click="router.back()" class="text-white mt-1">
            <i class="fas fa-arrow-left"></i>
          </button>

          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-base">{{ otherNickname }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-white/90">
              <i class="fas fa-home"></i>
              <span>{{ buildingName }}</span>
              <span
                class="text-xs bg-[var(--brand-2)] text-[var(--brand-5)] px-2 py-0.5 rounded-lg"
              >
                {{ sellerType }}
              </span>
            </div>
          </div>
        </div>

        <!-- 우측 영역 (판매자, 구매자에 따라 다르게) -->
        <div class="flex items-center gap-5">
          <!-- 판매자인 경우 거래 활성화 토글 -->
          <div v-if="isSeller" class="flex flex-col items-center text-sm">
            <span class="mb-1">거래 활성화</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="isActive" class="sr-only peer" />
              <div
                class="w-10 h-5 bg-[var(--brand-5)] peer-checked:bg-[var(--brand-2)] rounded-full transition-colors duration-300"
              ></div>
              <div
                class="absolute left-0 top-0 w-5 h-5 bg-white border rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"
              ></div>
            </label>
          </div>

          <!-- 구매자인 경우 거래 상태 -->
          <span
            v-else
            class="text-xs font-medium px-2 py-1 rounded"
            :class="{
              'bg-blue-100 text-blue-600': status === '진행',
              'bg-yellow-100 text-yellow-600': status === '중',
              'bg-gray-100 text-gray-500': status === '완료',
            }"
          >
            거래 {{ status }}
          </span>

          <!-- 나가기 버튼 -->
          <Button variant="button9" class="px-2 py-1 text-xs h-auto" @click="showModal = true"
            >나가기</Button
          >
        </div>

        <!-- 팝업 -->
        <PopupModal
          :is-visible="showModal"
          title="정말 채팅방을 나가시겠습니까?"
          message="이 작업은 되돌릴 수 없습니다."
          cancel-text="취소"
          confirm-text="확인"
          @cancel="handleCancel"
          @confirm="handleConfirm"
          @close="showModal = false"
        />
      </header>

      <!-- 채팅 내용 -->
      <main ref="scrollArea" class="flex-1 overflow-y-auto px-4 py-3 space-y-4" @scroll="onScroll">
        <div v-for="(msg, index) in viewMessages" :key="index" class="flex flex-col">
          <!-- 말풍선 -->
          <div
            :class="[
              msg.isMine
                ? 'self-end bg-[var(--brand-4)] text-gray-800'
                : 'self-start bg-[var(--brand-5)] border text-gray-800',
              'rounded-lg px-3 py-2 max-w-xs text-sm',
            ]"
          >
            <p>{{ msg.message }}</p>
          </div>

          <!-- 시간 -->
          <p
            :class="[
              msg.isMine
                ? 'self-end text-right text-xs text-gray-500 pr-1'
                : 'self-start text-xs text-gray-400 pl-1',
              'mt-1',
            ]"
          >
            {{ msg.createdAt || '' }}
          </p>
        </div>
      </main>

      <!-- 입력창 -->
      <footer class="px-4 py-3 bg-white border-t flex items-center gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="메시지를 입력하세요..."
          class="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
        />
        <button
          @click="sendMessage"
          class="w-10 h-10 flex items-center justify-center bg-[var(--brand-3)] text-white rounded-lg hover:bg-[var(--brand-2)]"
        >
          <i class="fas fa-paper-plane text-base"></i>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat/chat'
import { useStomp } from '@/utils/useStomp'
import { useAuthStore } from '@/stores/auth/auth'

import Button from '@/components/common/Button.vue'
import PopupModal from '@/components/common/PopupModal.vue'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()
const { connect, subscribeRoom, unsubscribeRoom, disconnect, connected } = useStomp()
const roomId = computed(() => String(route.params.roomId || ''))
//const myUserId = computed(() => authStore.userId)
const myUserId = 'user-001'

//나가기 모달
const showModal = ref(false)

const isSeller = localStorage.getItem('userRole') === 'SELLER' // 'BUYER' or 'SELLER'
const isActive = ref(true) // 거래 활성화 toggle
const status = ref('중') // 거래 상태 (구매자용)

const otherNickname = '구매자김씨' //대화 상대방 닉네임
const buildingName = '강남 신축 빌라'
const sellerType = '집주인' // or '세입자'

const messages = computed(() => chatStore.messages)

// 화면용: 정렬 방향(isMine) 붙이기
const viewMessages = computed(() =>
  messages.value.map((m) => ({
    ...m,
    //isMine: m.senderId === myUserId.value,
    isMine: m.senderId === myUserId,
  }))
)

const scrollArea = ref(null)
const isLoadingOlder = ref(false)
const hasMore = ref(true) // 더 불러올 수 있는지 (서버에서 빈 배열이면 false)

const scrollToBottom = async () => {
  await nextTick()
  const el = scrollArea.value
  if (el) el.scrollTop = el.scrollHeight
}

// 자동 스크롤(새 메시지 들어오면 아래로)
watch(
  () => messages.value.length,
  async () => {
    await scrollToBottom()
  }
)

const handleCancel = () => {
  showModal.value = false
}

const handleConfirm = async () => {
  try {
    await chatStore.leaveChatRoom() // 채팅방 나가기 API 호출
    showModal.value = false
    router.push('/chat/list') // 채팅방 목록 페이지로 이동
  } catch (err) {
    console.error('채팅방 나가기 실패:', err)
  }
}

function subscribeCurrentRoom() {
  if (!connected.value || !roomId.value) return
  subscribeRoom(roomId.value, (message /*, subscribedRoomId */) => {
    // 수신 즉시 스토어에 누적
    chatStore.messages.push(message)
    // 내가 보낸 게 아니면 읽음 처리
    //if (message?.senderId && message.senderId !== myUserId.value) {
    if (message?.senderId && message.senderId !== myUserId) {
      chatStore.markAsRead()
    }
  })
}

onMounted(async () => {
  // STOMP 연결 후 구독, 기존 메시지 로드
  connect(async () => {
    subscribeCurrentRoom()
    await chatStore.markAsRead()
  })
  // ★ 초기 메시지 로드(최신 → reverse → 아래로 쌓기)
  const loaded = await chatStore.loadInitialMessages(30)
  await scrollToBottom()
  hasMore.value = loaded > 0
})

// 동일 컴포넌트 내에서 route만 변경될 때를 대비
watch(
  () => roomId.value,
  async (newId, oldId) => {
    if (oldId) unsubscribeRoom(oldId)
    if (newId && connected.value) subscribeCurrentRoom()
    const loaded = await chatStore.loadInitialMessages(30)
    await scrollToBottom()
    hasMore.value = loaded > 0
  }
)

// ★ 스크롤 핸들러: 위로 당기면 이전 메시지 더 불러오기
async function onScroll() {
  const el = scrollArea.value
  if (!el || isLoadingOlder.value || !hasMore.value) return
  if (el.scrollTop <= 50) {
    isLoadingOlder.value = true
    const prevHeight = el.scrollHeight
    const prevTop = el.scrollTop
    const loaded = await chatStore.loadOlderMessages(30)
    hasMore.value = loaded > 0
    await nextTick()
    // 스크롤 위치 보정 (점프 방지)
    el.scrollTop = el.scrollHeight - prevHeight + prevTop
    isLoadingOlder.value = false
  }
}

onUnmounted(() => {
  if (roomId.value) unsubscribeRoom(roomId.value)
  disconnect() // 화면 떠날 때 완전히 끊고 싶으면 유지
})

const newMessage = ref('')
const sendMessage = async () => {
  const text = newMessage.value.trim()
  if (!text) return
  await chatStore.sendMessage(text) // 스토어가 publish & 로컬 목록 반영
  newMessage.value = ''
  await scrollToBottom() // ← 보낸 즉시 바닥으로
}
</script>
