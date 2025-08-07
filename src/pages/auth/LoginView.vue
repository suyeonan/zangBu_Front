<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 상태 관리
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const showPassword = ref(false)

// 더미 유저 데이터
const dummyUsers = [
  { email: 'test1@example.com', password: 'test1234' },
  { email: 'hello@zangbu.com', password: 'zangbu2025' },
  { email: 'admin@zangbu.com', password: 'admin123' },
]

// 로그인 처리
function login() {
  const user = dummyUsers.find(
    (u) => u.email === email.value.trim() && u.password === password.value
  )

  if (user) {
    errorMessage.value = ''

    // localStorage에 로그인 상태 저장 (auth.js 수정 없이)
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userEmail', user.email)

    // 로그인 성공 후 원래 가려던 페이지로 리다이렉트
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } else {
    errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 왼쪽 이미지 영역 -->
    <div class="w-1/2 h-full">
      <img
        src="https://image.ajunews.com/content/image/2022/04/04/20220404181310254680.jpg"
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
          <button class="login-button" @click="login">로그인</button>
        </div>

        <!-- 링크 영역 -->
        <div class="link-container">
          <router-link to="/auth/find-id" class="link">아이디 찾기</router-link>
          <span class="separator">|</span>
          <router-link to="/auth/find-password" class="link">비밀번호 찾기</router-link>
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
