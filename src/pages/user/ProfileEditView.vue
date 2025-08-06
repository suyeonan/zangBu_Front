<template>
  <section class="min-h-screen bg-gray-50 px-6 py-10">
    <!-- 뒤로가기 링크 -->
    <div class="max-w-4xl mx-auto mb-4">
      <router-link to="/user/mypage" class="text-sm text-brand-3 hover:underline">
        ← 마이 페이지로 돌아가기
      </router-link>
    </div>

    <!-- 제목 -->
    <div class="text-center mb-10">
      <h1 class="text-2xl font-bold">
        <i class="fa-solid fa-user-lock" style="color: var(--brand-3)"></i> 개인정보 수정
      </h1>
      <p class="text-sm text-gray-500">계정 정보와 설정을 업데이트해주세요.</p>
    </div>

    <!-- 사용자 정보 카드 -->
    <div class="bg-white shadow rounded-xl p-6 max-w-4xl mx-auto mb-6 flex items-center">
      <div
        class="w-16 h-16 bg-brand-3 rounded-full flex items-center justify-center text-xl font-bold text-white"
      >
        {{ user.name.charAt(0) }}
      </div>
      <div class="ml-4">
        <p class="font-semibold">{{ user.nickname }}</p>
        <p class="text-sm text-gray-500">{{ user.email }}</p>
        <p class="text-xs text-gray-400 mt-1">가입일: {{ user.joinedAt }}</p>
      </div>
    </div>

    <!-- 비밀번호 변경 섹션 -->
    <div class="bg-white shadow rounded-xl p-6 max-w-4xl mx-auto mb-6">
      <h2 class="font-semibold text-lg mb-1">
        <i class="fa-solid fa-lock" style="color: var(--brand-3)"></i> 비밀번호 변경
      </h2>
      <p class="text-xs mb-4 text-gray-600">보안 강화를 위해 비밀번호를 업데이트하세요.</p>
      <hr />
      <div class="space-y-4 mt-4">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
          <input
            type="password"
            placeholder="현재 비밀번호를 입력하세요"
            class="input-field w-full"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="새 비밀번호를 입력하세요"
            class="input-field w-full"
          />
        </div>

        <!-- 조건 불만족 시만 안내 문구 표시 -->
        <p v-if="!isLengthValid" class="text-xs text-red-500">비밀번호는 8자 이상이어야 합니다.</p>
        <p v-if="!isComplexValid" class="text-xs text-red-500 mb-12">
          비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.
        </p>

        <!-- 새 비밀번호 확인 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="새 비밀번호를 다시 입력하세요"
            class="input-field w-full"
          />
        </div>

        <!-- 조건부 에러 메시지 -->
        <p v-if="confirmPassword && !isPasswordMatch" class="text-xs text-red-500">
          비밀번호가 다릅니다.
        </p>
        <button class="primary-button">비밀번호 변경</button>
      </div>
    </div>

    <!-- 닉네임 변경 섹션 -->
    <div class="bg-white shadow rounded-xl p-6 max-w-4xl mx-auto mb-6">
      <h2 class="font-semibold text-lg mb-1">
        <i class="fa-regular fa-user" style="color: var(--brand-3)"></i> 닉네임 변경
      </h2>
      <p class="text-xs mb-4 text-gray-600">나를 나타내는 고유한 닉네임을 선택하세요.</p>
      <hr />
      <div class="space-y-4 mt-4">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">현재 닉네임</label>
          <input
            type="text"
            disabled
            :value="user.nickname"
            class="input-field w-full bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">새 닉네임</label>
          <div class="flex gap-2 items-center">
            <input type="text" placeholder="새 닉네임을 입력하세요" class="input-field flex-1" />
            <button class="secondary-button whitespace-nowrap h-full">중복 확인</button>
          </div>
        </div>
        <button class="primary-button">닉네임 변경</button>
      </div>
    </div>

    <!-- 알림 설정 섹션 -->
    <div class="bg-white shadow rounded-xl p-6 max-w-4xl mx-auto mb-20">
      <h2 class="font-semibold text-lg mb-4">
        <i class="fa-solid fa-bell" style="color: var(--brand-3)"></i> 알림 수신 설정
      </h2>
      <hr class="mb-4" />
      <h2 class="font-semibold text-lg mb-4">서비스/마케팅 알림</h2>

      <div
        class="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
      >
        <span
          :class="['text-sm font-semibold', isNotificationOn ? 'text-green-700' : 'text-gray-500']"
        >
          {{ isNotificationOn ? '알림 수신 중' : '알림 수신 꺼짐' }}
        </span>

        <!-- 토글 스위치 -->
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" class="sr-only peer" v-model="isNotificationOn" />
          <!-- 배경 바 -->
          <div
            class="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-brand-3 transition-colors duration-200"
          ></div>
          <!-- 안쪽 동그라미 -->
          <div
            class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform duration-200"
          ></div>
        </label>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

// 알림 수신 여부 상태
const isNotificationOn = ref(true)

const user = {
  name: '김철수',
  nickname: '김철수123',
  email: 'kim.chulsoo@example.com',
  joinedAt: '2023년 6월 1일',
}

const newPassword = ref('')
const confirmPassword = ref('')

// 일치 여부 검사
const isPasswordMatch = computed(() => {
  return confirmPassword.value === '' || confirmPassword.value === newPassword.value
})

// 비밀번호 길이 조건 검사
const isLengthValid = computed(() => newPassword.value.length >= 8)

// 비밀번호 복잡도 조건 검사
const isComplexValid = computed(
  () =>
    /[A-Z]/.test(newPassword.value) && // 대문자
    /[a-z]/.test(newPassword.value) && // 소문자
    /[0-9]/.test(newPassword.value) // 숫자
)
</script>

<style scoped>
.input-field {
  padding: 0.5rem 1rem;
  border: 1px solid var(--brand-3);
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s ease;
}
.input-field:focus {
  border-color: var(--brand-2);
}
.primary-button {
  padding: 10px 20px;
  background: var(--brand-3);
  color: var(--text-3);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.primary-button:hover {
  background: var(--brand-2);
}
.secondary-button {
  padding: 10px 16px;
  background: var(--bg-2);
  border: 2px solid var(--brand-3);
  color: var(--brand-3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}
.secondary-button:hover {
  background: #f1f1f1;
}
</style>
