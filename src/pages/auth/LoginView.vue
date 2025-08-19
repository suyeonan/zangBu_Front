<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth'
import { login as loginApi } from '@/api/auth/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 상태 관리
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

// 로그인 처리
async function login() {
  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = '이메일과 비밀번호를 모두 입력해주세요.'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    // 스토어로 위임
    await authStore.login({
      email: email.value.trim(),
      password: password.value,
    })
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (e) {
    // 스토어에서 만든 Error(message, status)
    errorMessage.value = e.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 왼쪽 이미지 영역 -->
    <div class="w-1/2 h-full">
      <img
        src="/src/assets/login_image.png"
        alt="로그인 이미지"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- 오른쪽 로그인 영역 -->
    <div class="login-container">
      <div class="login-content">
        <!-- 로고 -->
        <div class="logo-container">
          <img src="../../assets/logo.png" alt="ZangBu 로고" class="logo-image" />
        </div>

        <div class="input-container">
          <!-- 이메일 입력 -->
          <div class="input-group">
            <label class="input-label">이메일</label>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              class="input-field"
              v-model="email"
              :disabled="isLoading"
            />
          </div>
          <!-- 비밀번호 -->
          <div class="input-group">
            <label class="input-label">비밀번호</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="비밀번호를 입력하세요 (최소 8자)"
                class="input-field pr-10"
                @keyup.enter="login"
                :disabled="isLoading"
              />
              <span
                class="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
          </div>

          <!-- 오류 메시지 -->
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>

        <!-- 로그인 버튼 -->
        <div class="button-container">
          <button class="login-button" @click="login" :disabled="isLoading">
            <span v-if="isLoading">로그인 중...</span>
            <span v-else>로그인</span>
          </button>
        </div>

        <!-- 링크 영역 -->
        <div class="link-container">
          <router-link to="/auth/find-id" class="link">아이디 찾기</router-link>
          <span class="separator">|</span>
          <router-link :to="{ path: '/auth/verify', query: { mode: 'password' } }" class="link">
            비밀번호 찾기
          </router-link>
        </div>

        <!-- 회원가입 링크 -->
        <div class="signup-container">
          아직 회원이 아니신가요?
          <router-link to="/auth/signup" class="link">회원가입하기</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-2);
  padding: 2rem;
}

.login-content {
  width: 100%;
  max-width: 64rem;
  padding: 2rem;
}

.logo-container {
  display: flex;
  justify-content: flex-start;
  margin-left: -5%;
  margin-bottom: 2rem;
}

.logo-image {
  max-width: 35%;
}

.input-container {
  margin-bottom: 6rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-1);
  margin-bottom: 0.25rem;
}

.input-field {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid var(--brand-3);
  border-radius: 0.375rem;
  outline: none;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: var(--brand-3);
  box-shadow: 0 0 0 2px rgba(104, 166, 60, 0.2);
}

.button-container {
  margin-bottom: 1rem;
}

.login-button {
  width: 100%;
  background-color: var(--brand-4);
  color: var(--text-3);
  padding: 0.5rem 0;
  border: none;
  border-radius: 0.375rem;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: var(--brand-3);
}

.link-container {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.875rem;
  color: var(--brand-3);
  margin-bottom: 0.5rem;
}

.link {
  text-decoration: none;
  color: var(--brand-3);
  margin: 0 0.5rem;
}

.link:hover {
  text-decoration: underline;
}

.separator {
  color: var(--brand-3);
  margin: 0 0.5rem;
}

.signup-container {
  text-align: center;
  font-size: 0.875rem;
  color: var(--brand-3);
}

.signup-link {
  color: var(--brand-3);
  text-decoration: none;
}

.signup-link:hover {
  text-decoration: underline;
}

.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  text-align: left;
}
</style>
