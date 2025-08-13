import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/auth/auth'
import { ref, readonly } from 'vue'

let stompClient = null //STOMP 연결을 담당하는 Client 객체
let isConnected = false //현재 연결 상태
const subscriptions = new Map() //현재 구독을 저장하는 변수
const subscribeIntents = new Map() //roomId -> callback(payload, roomId) // 재연결 시 복구용 (구독 콜백을 기억)

// 옵션: 환경에 맞게 수정
const WS_URL = 'ws://localhost:8080/chat'
const SUBSCRIBE_PREFIX = '/topic/chat.' // 예: /topic/chat.{roomId}
const TOPIC_PREFIX = '/app/chat.send' // 예: /app/chat.send/{roomId}

// ★ FIX: 반응형 상태 (컴포넌트 자동 갱신)
const connectedRef = ref(false)
const activeRoomsRef = ref([])

function refreshActiveRooms() {
  activeRoomsRef.value = Array.from(subscriptions.keys())
}

// STOMP 연결
export function useStomp() {
  //JWT 토큰을 가져와 연결
  const connect = (onConnected = () => {}) => {
    // 이미 연결 중이면 무시
    if (stompClient?.connected) {
      isConnected = true
      onConnected()
      return
    }

    const authStore = useAuthStore()
    //const token = authStore?.accessToken
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTAwMSIsInJvbGUiOiJST0xFX01FTUJFUiIsImlhdCI6MTc1NTA1ODMxNywiZXhwIjoxNzU1MDY0MzE3fQ.fR1nmbSNflxCSIN9OZZkBEv_iZo6GKNo5IuK1Wjn9I0'

    if (!token) {
      console.warn('[STOMP] JWT 토큰이 없습니다.')
    }

    const client = new Client({
      brokerURL: WS_URL, // 순수 WS
      // reconnectDelay: 2000, // 자동 재연결 (2s)
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      connectHeaders: {
        Authorization: `Bearer ${token || ''}`, // STOMP CONNECT 헤더
      },
      debug: (msg) => console.log('[STOMP FRAMES]', msg), // ★ 추가
      onConnect: () => {
        isConnected = true
        connectedRef.value = true // ★ FIX
        console.log('[STOMP] CONNECTED')

        // 재연결 시, 이전 구독 의도 자동 복구
        subscribeIntents.forEach((cb, roomId) => _subscribeInternal(roomId, cb, true))

        refreshActiveRooms() // ★ FIX
        onConnected()
      },
      onStompError: (frame) => {
        console.error('[STOMP] ERROR headers=', frame?.headers, ' body=', frame?.body)
      },
      onWebSocketClose: (evt) => {
        // 연결이 끊기면 실제 sub 핸들은 더 이상 유효하지 않으므로 subscriptions는 비워둠
        // 단, subscribeIntents는 유지해서 자동 재구독 가능
        isConnected = false
        connectedRef.value = false // ★ FIX
        subscriptions.clear()
        refreshActiveRooms() // ★ FIX
        console.warn('[STOMP] WebSocket closed', evt?.code, evt?.reason)
      },
    })
    stompClient = client
    client.activate()
  }

  //연결 해제
  const disconnect = () => {
    unsubscribeAll(true) // true: 자동 재구독 의도까지 제거
    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
    }
    isConnected = false
    connectedRef.value = false // ★ FIX
    refreshActiveRooms() // ★ FIX
    console.log('[STOMP] DISCONNECTED')
  }

  // 구독
  function _subscribeInternal(roomId, callback, recovering = false) {
    if (!roomId) return
    if (!stompClient?.connected) {
      console.warn('[STOMP] 연결 전, 구독 대기:', roomId)
      return
    }

    // 중복 방지: 기존 구독 있으면 해제 후 재구독
    const prev = subscriptions.get(roomId)
    if (prev) {
      try {
        prev.unsubscribe()
      } catch {}
      subscriptions.delete(roomId)
    }

    const dest = `${SUBSCRIBE_PREFIX}${roomId}`
    const sub = stompClient.subscribe(dest, (message) => {
      const body = message?.body
      try {
        const parsed = body ? JSON.parse(body) : null
        callback?.(parsed ?? body, roomId)
      } catch (e) {
        console.error('[STOMP] parse error @', roomId, e)
        callback?.(body, roomId)
      }
    })

    subscriptions.set(roomId, sub)
    if (!recovering) {
      // 수동 구독한 것은 의도 저장 → 재연결 시 자동 재구독
      subscribeIntents.set(roomId, callback)
    }
    console.log('[STOMP] SUBSCRIBE', dest)
    refreshActiveRooms() // ★ FIX
  }

  const subscribeRoom = (roomId, callback) => _subscribeInternal(roomId, callback, false)

  // 특정 방 구독 해제
  const unsubscribeRoom = (roomId) => {
    const sub = subscriptions.get(roomId)
    if (sub) {
      try {
        sub.unsubscribe()
      } catch {}
      subscriptions.delete(roomId)
      subscribeIntents.delete(roomId)
      console.log('[STOMP] UNSUBSCRIBE', `${SUBSCRIBE_PREFIX}${roomId}`)
      refreshActiveRooms() // ★ FIX
    }
  }

  // withIntent=true면 자동 재구독 의도도 함께 제거
  const unsubscribeAll = (withIntent = false) => {
    subscriptions.forEach((sub, roomId) => {
      try {
        sub.unsubscribe()
      } catch {}
      console.log('[STOMP] UNSUBSCRIBE', `${SUBSCRIBE_PREFIX}${roomId}`)
    })
    subscriptions.clear()
    if (withIntent) subscribeIntents.clear()
    refreshActiveRooms() // ★ FIX
  }

  //STOMP 메시지 전송
  const sendToRoom = (roomId, body) => {
    if (!roomId || !isConnected || !stompClient) return
    stompClient.publish({
      destination: `${TOPIC_PREFIX}/${roomId}`,
      body: JSON.stringify(body ?? {}),
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    })
  }

  // 헬퍼
  const getIsConnected = () => !!isConnected
  const getActiveRooms = () => Array.from(subscriptions.keys())

  return {
    connect,
    disconnect,
    subscribeRoom,
    unsubscribeRoom,
    unsubscribeAll,
    sendToRoom,
    connected: readonly(connectedRef),
    activeRooms: readonly(activeRoomsRef),
    getIsConnected,
    getActiveRooms,
  }
}
