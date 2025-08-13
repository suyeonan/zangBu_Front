<template>
  <div class="w-full max-w-screen-xl mx-auto">
    <div class="flex flex-col min-h-screen bg-[var(--bg-1)] py-6 px-4 md:px-6 xl:px-8">
      <div class="flex items-center gap-3 text-lg mb-5">
        <button @click="router.back()" class="text-[var(--text-1)] hover:text-[var(--brand-1)]">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h3 class="font-semibold">채팅방 목록</h3>
      </div>

      <main class="flex-1 flex flex-col">
        <!-- 필터 탭 -->
        <div class="flex justify-center my-6 gap-10 md:gap-[260px]">
          <div
            v-for="tab in tabs"
            :key="tab.type"
            :class="[
              'flex flex-col-reverse items-center cursor-pointer text-[var(--text-1)] transition',
              tab.type === filterType ? 'text-black font-bold' : '',
            ]"
            @click="selectTab(tab.type)"
          >
            <div class="text-xl font-bold">
              {{ tab.count }}
              <span
                v-if="tab.unread > 0"
                class="inline-flex items-center justify-center ml-1 w-4 h-4 text-[11px] font-semibold bg-[var(--status-1)] text-white rounded-full"
              >
                {{ tab.unread }}
              </span>
            </div>
            <div class="mt-1 text-sm">{{ tab.label }}</div>
          </div>
        </div>

        <!-- 채팅방 리스트 -->
        <div class="flex flex-col gap-4">
          <div
            v-for="room in rooms"
            :key="room.chatRoomId"
            class="flex items-start bg-[var(--bg-2)] p-4 rounded-lg relative cursor-pointer"
            @click="goToChatRoom(room.chatRoomId)"
          >
            <div
              class="w-10 h-10 rounded-full text-white font-bold text-base flex items-center justify-center mr-3 flex-shrink-0"
              :style="{
                backgroundColor: room.type === 'BUY' ? 'var(--brand-3)' : 'var(--brand-2)',
              }"
            >
              {{ room.otherUserNickname.charAt(0) }}
            </div>

            <div class="flex-1">
              <div class="flex items-center justify-between text-sm text-[var(--text-2)] mb-1">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold">{{ room.otherUserNickname }}</span>
                    <div class="flex gap-1">
                      <span class="text-xs px-2 py-1 rounded bg-[var(--brand-3)] text-white">{{
                        room.sellerType
                      }}</span>
                      <span class="text-xs px-2 py-1 rounded bg-[var(--status-1)] text-white">{{
                        room.status
                      }}</span>
                    </div>
                  </div>
                  <div class="text-xs text-[var(--text-1)] mt-0.5">
                    <i class="fa-solid fa-house fa-lg"></i>
                    {{ room.buildingName }} | <i class="fa-solid fa-sack-dollar"></i> 전세
                    {{ room.price }}억
                  </div>
                </div>
                <span class="text-xs text-[var(--text-1)]">{{ room.lastMessageTime }}</span>
              </div>
              <div class="text-sm text-[var(--text-1)]">{{ room.lastMessage }}</div>
            </div>

            <div
              v-if="room.unreadCount > 0"
              class="absolute right-3 bottom-3 text-xs px-2 py-0.5 rounded-full bg-[var(--brand-3)] text-white"
            >
              {{ room.unreadCount }}
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div class="flex justify-center mt-6 gap-2">
          <!-- 이전 버튼 -->
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border text-sm"
            :class="
              currentPage === 1
                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100 border-gray-400'
            "
          >
            <i class="fa-solid fa-angle-left"></i>
          </button>

          <!-- 페이지 번호 -->
          <button
            v-for="page in totalPages"
            :key="page"
            @click="changePage(page)"
            class="px-3 py-1 rounded border text-sm"
            :class="
              page === currentPage
                ? 'bg-[var(--brand-3)] text-white border-[var(--brand-3)]'
                : 'border-gray-400 hover:bg-gray-100'
            "
          >
            {{ page }}
          </button>

          <!-- 다음 버튼 -->
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border text-sm"
            :class="
              currentPage === totalPages
                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100 border-gray-400'
            "
          >
            <i class="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useChatStore } from '@/stores/chat/chat'
import { useStomp } from '@/utils/useStomp'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth'

const chatStore = useChatStore()
const { connect, subscribeRoom, unsubscribeAll, disconnect } = useStomp()
const authStore = useAuthStore()
const router = useRouter()

const filterType = ref('ALL') //'ALL', 'BUY', 'SELL'
const rooms = ref([]) //현재 페이지 방 목록
const loading = ref(false)
const errorMsg = ref('')
const currentPage = ref(1)
const pageSize = 5
const totalCount = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))

//  탭 상태(백엔드에서 내려주면 우선 사용)
const tabs = ref([
  { label: '전체', type: 'ALL', count: 0, unread: 0 },
  { label: '구매', type: 'BUY', count: 0, unread: 0 },
  { label: '판매', type: 'SELL', count: 0, unread: 0 },
])

//  탭 계산(백엔드 미제공 시)
function computeTabsFrom(roomsList) {
  const buyRooms = roomsList.filter((r) => r.type === 'BUY')
  const sellRooms = roomsList.filter((r) => r.type === 'SELL')
  const buyUnread = buyRooms.filter((r) => (r.unreadCount || 0) > 0).length
  const sellUnread = sellRooms.filter((r) => (r.unreadCount || 0) > 0).length
  const allUnread = roomsList.filter((r) => (r.unreadCount || 0) > 0).length

  tabs.value = [
    { label: '전체', type: 'ALL', count: roomsList.length, unread: allUnread },
    { label: '구매', type: 'BUY', count: buyRooms.length, unread: buyUnread },
    { label: '판매', type: 'SELL', count: sellRooms.length, unread: sellUnread },
  ]
}

/** ---------------------------
 * API: 채팅방 목록 조회
 * 응답 예시:
 * {
 *   items: Room[],
 *   total: number,
 *   counts: {
 *     ALL: { count: number, unread: number },
 *     BUY: { count: number, unread: number },
 *     SELL:{ count: number, unread: number }
 *   }
 * }
 * -------------------------- */

async function fetchRooms() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await axios.get('http://localhost:8080/chat/list', {
      params: {
        type: filterType.value, // 'ALL' | 'BUY' | 'SELL'
        page: currentPage.value, // 1-base 또는 0-base면 서버에 맞춰 수정
        size: pageSize,
      },
    })

    // 호환 처리: items/total/counts가 없을 수도 있으니 안전하게
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    const total = Number.isFinite(data?.total) ? data.total : items.length
    rooms.value = items
    totalCount.value = total

    // 탭 카운트 세팅(백엔드 제공 우선)
    if (data?.counts?.ALL && data?.counts?.BUY && data?.counts?.SELL) {
      tabs.value = [
        {
          label: '전체',
          type: 'ALL',
          count: data.counts.ALL.count,
          unread: data.counts.ALL.unread,
        },
        {
          label: '구매',
          type: 'BUY',
          count: data.counts.BUY.count,
          unread: data.counts.BUY.unread,
        },
        {
          label: '판매',
          type: 'SELL',
          count: data.counts.SELL.count,
          unread: data.counts.SELL.unread,
        },
      ]
    } else {
      // 서버가 counts를 안 주면 현재 페이지 기준으로 대강 계산(fallback)
      computeTabsFrom(items)
    }

    // 방 목록이 바뀌었으므로 구독 재구성
    resubscribeForCurrentPage()
  } catch (err) {
    console.error(err)
    errorMsg.value = '채팅방 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

/** ---------------------------
 * STOMP: 현재 페이지 방들만 구독
 * -------------------------- */
function resubscribeForCurrentPage() {
  if (!rooms.value?.length) {
    unsubscribeAll()
    return
  }
  // 기존 구독 해제 후 현재 페이지만 재구독
  unsubscribeAll()
  rooms.value.forEach((room) => {
    subscribeRoom(room.chatRoomId, (message, roomId) => {
      const target = rooms.value.find((r) => r.chatRoomId === roomId)
      if (!target) return
      target.lastMessage = message.message
      target.lastMessageTime = message.createdAt
      if (authStore.userId && message.senderId !== authStore.userId) {
        target.unreadCount = (target.unreadCount || 0) + 1
      }
    })
  })
}

/** ---------------------------
 * 탭/페이지 전환
 * -------------------------- */
function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function selectTab(type) {
  if (filterType.value === type) return
  filterType.value = type
  currentPage.value = 1
}

/** ---------------------------
 * 라우팅/구독/초기화
 * -------------------------- */
const goToChatRoom = (roomId) => {
  router.push(`/chat/room/${roomId}`)
}

onMounted(async () => {
  // STOMP 연결 후 목록 로딩
  connect(() => {
    // 연결 성공 콜백에서 목록 조회하면, 구독도 연결 이후에 정확히 붙음
    fetchRooms()
  })
})

// 탭/페이지 변경 시 재조회
watch([filterType, currentPage], () => {
  fetchRooms()
})

onBeforeUnmount(() => {
  disconnect()
})
</script>
