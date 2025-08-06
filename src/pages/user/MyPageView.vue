<script setup>
// 마이페이지 관련 로직
import PropertyCard from '@/components/common/PropertyCard.vue'
import { ref } from 'vue'

// 사용자 정보
const user = {
  name: '김철수',
  email: 'kim.chulsoo@example.com',
  bookmarked: 5,
  registered: 2,
}

const selectedTab = ref('favorite')

// 예시 데이터
const favoriteProperties = [
  { id: 1, title: '찜 매물 A', imageUrl: '', price: '3억', location: '서울', type: '매매' },
  { id: 2, title: '찜 매물 B', imageUrl: '', price: '2억', location: '인천', type: '매매' },
  { id: 6, title: '찜 매물 B', imageUrl: '', price: '2억', location: '인천', type: '월세' },
  { id: 7, title: '찜 매물 B', imageUrl: '', price: '2억', location: '인천', type: '월세' },
  { id: 8, title: '찜 매물 B', imageUrl: '', price: '2억', location: '인천', type: '월세' },
]

const myProperties = [
  { id: 3, title: '내 매물 A', imageUrl: '', price: '4억', location: '부산', type: '전세' },
  { id: 4, title: '내 매물 B', imageUrl: '', price: '1.5억', location: '대구', type: '매매' },
  { id: 5, title: '내 매물 B', imageUrl: '', price: '1.5억', location: '대구', type: '매매' },
]

// async function handleDelete(buildingId) {
//   try {
//     await axios.delete(`/building/bookmark/${buildingId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })

//     // 리스트에서 제거
//     favoriteProperties.value = favoriteProperties.value.filter(
//       (property) => property.id !== buildingId
//     )
//   } catch (err) {
//     console.error('찜 해제 실패:', err)
//   }
// }
</script>

<template>
  <section class="px-6 py-10 bg-gray-50 min-h-screen">
    <!-- 제목 -->
    <h1 class="text-2xl font-bold text-center mb-4">
      <i class="fa-solid fa-user" style="color: var(--brand-3)"></i> 마이페이지
    </h1>
    <p class="text-xs text-center mb-8">계정을 관리하고 저장된 매물을 확인하세요.</p>

    <!-- 사용자 카드 -->
    <div class="bg-white shadow rounded-xl p-6 max-w-6xl mx-auto mb-4 flex items-center">
      <div
        class="w-16 h-16 bg-brand-3 rounded-full flex items-center justify-center text-xl font-bold text-white"
      >
        {{ user.name.charAt(0) }}
      </div>
      <div class="ml-4">
        <p class="font-semibold text-lg">{{ user.name }}</p>
        <p class="text-sm text-gray-600">{{ user.email }}</p>
        <div class="flex space-x-4 mt-2 text-gray-700">
          <!-- 찜한 매물 -->
          <div class="stat-block">
            <div class="stat-number">{{ favoriteProperties.length }}</div>
            <div class="stat-label">찜한 매물</div>
          </div>
          <!-- 등록한 매물 -->
          <div class="stat-block">
            <div class="stat-number">{{ user.registered }}</div>
            <div class="stat-label">등록한 매물</div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-buttons mt-6 p-6">
      <router-link to="/user/profile-edit" class="primary-button"
        ><i class="fa-regular fa-pen-to-square mr-2"></i>개인 정보 수정</router-link
      >
      <router-link to="/auth/login" class="primary-button"
        ><i class="fa-solid fa-right-from-bracket mr-2"></i>로그아웃</router-link
      >
      <router-link to="/user/withdraw" class="secondary-button"
        ><i class="fa-solid fa-trash-can mr-2"></i>계정 삭제</router-link
      >
    </div>

    <!-- 찜한/등록한 매물 섹션 -->
    <div class="max-w-6xl mx-auto mt-6 p-6 rounded-lg mb-20" style="background: var(--bg-1)">
      <!-- 탭 버튼 -->
      <div class="flex justify-center gap-4 mb-6">
        <button
          class="tab-button"
          :class="{ active: selectedTab === 'favorite' }"
          @click="selectedTab = 'favorite'"
        >
          <i class="fa-regular fa-heart mr-2"></i> 내가 찜한 매물
        </button>
        <button
          class="tab-button"
          :class="{ active: selectedTab === 'my' }"
          @click="selectedTab = 'my'"
        >
          <i class="fa-solid fa-house mr-2"></i> 내가 등록한 매물
        </button>
      </div>

      <!-- 제목과 구분선 -->
      <div class="text-left mb-6">
        <div class="flex items-center gap-2">
          <i
            :class="selectedTab === 'favorite' ? 'fa-regular fa-heart' : 'fa-solid fa-house'"
            style="color: var(--brand-3)"
          ></i>
          <h2 class="text-xl font-semibold">
            {{ selectedTab === 'favorite' ? '내가 찜한 매물' : '내가 등록한 매물' }}
          </h2>
        </div>
        <hr class="mt-2" />
      </div>

      <!-- 카드 리스트 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <PropertyCard
          v-for="property in selectedTab === 'favorite' ? favoriteProperties : myProperties"
          :key="property.id"
          :property="property"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--brand-3); /* 강조 색 */
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-2);
}

.tab-button {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  border: 1.5px solid var(--brand-3);
  background-color: var(--bg-2);
  color: var(--text-1);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.tab-button.active {
  background-color: var(--brand-3);
  color: var(--text-3);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.primary-button {
  height: 40px;
  padding: 0 20px;
  background: var(--brand-3);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: var(--text-3);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.2s ease;
  text-align: center;
  line-height: 40px;
  text-decoration: none;
  display: inline-block;
}

.primary-button:hover {
  background: var(--brand-2);
}

.secondary-button {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  border: 2px solid var(--status-2);
  background: var(--bg-2);
  cursor: pointer;
  color: var(--status-2);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  text-align: center;
  line-height: 40px;
  text-decoration: none;
  display: inline-block;
}

.secondary-button:hover {
  background: #fef2f2;
}
</style>
