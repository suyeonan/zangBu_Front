import { ref, computed, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { defineStore } from 'pinia'
import { useStomp } from '@/utils/useStomp'
import axios from 'axios'

export const useChatStore = defineStore('chat', () => {
  const chatRooms = ref([])
  const currentChat = ref(null)
  const messages = ref([])
  const unreadCount = ref(0)
  const route = useRoute()
  const roomId = computed(() => String(route.params.roomId || ''))
  const { sendToRoom, subscribeRoom, unsubscribeRoom, connected } = useStomp()
  const oldestMessageId = ref(null) //가장 오래 로드된(리스트 맨 앞) 메시지 id 기억 → 더보기 요청용

  // 채팅방 목록 조회 로직
  async function getChatRooms(type = 'ALL') {
    try {
      const res = await axios.get('/chat/list', { params: { type } })
      chatRooms.value = res.data.result
    } catch (err) {
      console.error('채팅방 목록 조회 실패:', err)
    }
  }

  // ★ 내부 공용 페치: 서버는 최신부터(DESC) 반환 → 여기서 reverse()로 ASC로 맞춤
  async function fetchMessages(lastMessageId = null, limit = 5) {
    const { data } = await axios.get(`http://localhost:8080/chat/room/${roomId.value}`, {
      params: { lastMessageId, limit },
    })
    const list = Array.isArray(data) ? data : []
    return list.reverse() // 오래→최근 순으로 변환
  }

  // ★ 최초 로드: 화면엔 오래→최근, 스크롤은 맨 아래로
  async function loadInitialMessages(limit = 5) {
    try {
      const asc = await fetchMessages(null, limit)
      messages.value = asc
      oldestMessageId.value = asc[0]?.chatMessageId ?? null
      currentChat.value = { chatRoomId: roomId.value }
      return asc.length
    } catch (err) {
      console.error('초기 메시지 로드 실패:', err)
      messages.value = []
      oldestMessageId.value = null
      return 0
    }
  }

  // ★ 더보기(위로 스크롤): 가장 오래 로드된 id보다 더 오래된 묶음을 앞쪽에 붙임
  async function loadOlderMessages(limit = 30) {
    if (!oldestMessageId.value) return 0
    try {
      const olderAsc = await fetchMessages(oldestMessageId.value, limit)
      if (olderAsc.length === 0) return 0
      messages.value = [...olderAsc, ...messages.value]
      oldestMessageId.value = messages.value[0]?.chatMessageId ?? oldestMessageId.value
      return olderAsc.length
    } catch (err) {
      console.error('이전 메시지 로드 실패:', err)
      return 0
    }
  }

  // 메시지 전송 로직
  async function sendMessage(message) {
    try {
      sendToRoom(roomId.value, { message: message })
    } catch (err) {
      console.error('STOMP 메시지 전송 실패:', err)
    }
  }

  // 채팅방 생성 로직
  async function createChatRoom(buildingId, consumerId) {
    try {
      const res = await axios.post('/chat/room', {
        buildingId,
        consumerId,
      })
      return res.data.result.chatRoomId // 생성된 채팅방 ID
    } catch (err) {
      console.error('채팅방 생성 실패:', err)
      throw err
    }
  }

  // 채팅방 나가기 로직
  async function leaveChatRoom() {
    try {
      await axios.patch(`/chat/room/list/exit/${roomId.value}`)

      unsubscribeRoom(roomId.value) // STOMP 구독 해제

      chatRooms.value = chatRooms.value.filter((r) => r.chatRoomId !== roomId.value)
    } catch (err) {
      console.error('채팅방 나가기 실패:', err)
    }
  }

  // 읽음 처리 로직
  async function markAsRead() {
    try {
      //await axios.put(`/chat/room/${roomId.value}/read`)
      await axios.put(`http://localhost:8080/chat/room/${roomId.value}/read`)
      const room = chatRooms.value.find((r) => r.chatRoomId === roomId.value)
      if (room) room.unreadCount = 0
    } catch (err) {
      console.error('읽음 처리 실패:', err)
    }
  }

  return {
    chatRooms,
    currentChat,
    messages,
    unreadCount,
    oldestMessageId,
    getChatRooms,
    loadInitialMessages,
    loadOlderMessages,
    sendMessage,
    createChatRoom,
    leaveChatRoom,
    markAsRead,
  }
})
