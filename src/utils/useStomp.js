import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/auth/auth'

//STOMP 연결을 담당하는 Client 객체
let stompClient = null
//현재 연결 상태
let isConnected = false
//현재 구독을 저장하는 변수
let subscriptions = new Map()

// STOMP 연결
export function useStomp() {
  //JWT 토큰을 가져와 연결
  const connect = (onConnectedCallback = () => {}) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    const client = new Client({
      brokerURL: 'ws://localhost:8080/chat', // 순수 WS
      reconnectDelay: 5000,
      connectHeaders: {
        // STOMP CONNECT 헤더
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        isConnected = true
        stompClient = client
        console.log('STOMP 연결 성공')
        onConnectedCallback() // 연결 성공 후 콜백 호출
      },
    })
    client.activate()
  }

  // 특정 방 구독
  const subscribeRoom = (roomId, callback) => {
    if (!isConnected || !stompClient) return
    if (subscriptions.has(roomId)) {
      // 이미 구독 중이면 해제 후 다시 구독
      subscriptions.get(roomId).unsubscribe()
    }
    const sub = stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
      callback(JSON.parse(message.body), roomId)
    })
    subscriptions.set(roomId, sub)
  }

  // 특정 방 구독 해제
  const unsubscribeRoom = (roomId) => {
    if (subscriptions.has(roomId)) {
      subscriptions.get(roomId).unsubscribe()
      subscriptions.delete(roomId)
    }
  }

  // 전체 구독 해제
  const unsubscribeAll = () => {
    subscriptions.forEach((sub) => sub.unsubscribe())
    subscriptions.clear()
  }

  //STOMP 메시지 전송
  const sendStompMessage = (destination, body) => {
    if (!isConnected || !stompClient) return
    stompClient.publish({
      destination,
      body: JSON.stringify(body),
    })
  }

  //연결 종료
  const disconnect = () => {
    unsubscribeAll()
    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
      isConnected = false
    }
  }

  return {
    connect,
    subscribeRoom,
    unsubscribeRoom,
    unsubscribeAll,
    sendStompMessage,
    disconnect,
  }
}
