<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { checkEmail, checkNickname, signup } from '@/api/auth/auth'

const router = useRouter()

// 비밀번호 표시 토글
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 알림(마케팅) 동의 상태: true/false
const consentNotification = ref(null)

// 약관 체크 상태
const allChecked = ref(false)
const terms = ref({
  privacy: false,
  property: false,
  usage: false,
})

// 모두 동의 핸들러
function toggleAll() {
  const value = allChecked.value
  terms.value.privacy = value
  terms.value.property = value
  terms.value.usage = value
}

// 개별 동의 변경 시 전체동의 상태 동기화
function checkIfAllAgreed() {
  allChecked.value = terms.value.privacy && terms.value.property && terms.value.usage
}

// 상태
const email = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')

// 로딩/결과 상태
const isCheckingEmail = ref(false)
const isCheckingNick = ref(false)
const isSubmitting = ref(false)

const emailOk = ref(null) // null | true | false
const nickOk = ref(null)

const emailMsg = ref('')
const nickMsg = ref('')

// 유효성 검사
const emailValid = computed(() => /\S+@\S+\.\S+/.test(email.value))
const nicknameValid = computed(() => {
  const n = nickname.value.trim()
  return n.length >= 2 && n.length <= 20
})

// 입력이 바뀌면 결과 초기화
watch(email, () => {
  emailOk.value = null
  emailMsg.value = ''
})
watch(nickname, () => {
  nickOk.value = null
  nickMsg.value = ''
})

// 이메일 중복 확인
async function onCheckEmail() {
  if (!emailValid.value) {
    emailOk.value = false
    emailMsg.value = '올바른 이메일 형식을 입력해주세요.'
    return
  }
  isCheckingEmail.value = true
  try {
    await checkEmail(email.value) // 200 OK이면 사용 가능
    emailOk.value = true
    emailMsg.value = '사용 가능한 이메일입니다.'
  } catch (err) {
    if (err?.response?.status === 409) {
      emailOk.value = false
      emailMsg.value = err.response?.data || '이미 사용 중인 이메일입니다.'
    } else {
      emailOk.value = false
      emailMsg.value = '확인 중 오류가 발생했습니다.'
    }
  } finally {
    isCheckingEmail.value = false
  }
}

// 닉네임 중복 확인
async function onCheckNickname() {
  if (!nicknameValid.value) {
    nickOk.value = false
    nickMsg.value = '닉네임은 2~20자여야 합니다.'
    return
  }
  isCheckingNick.value = true
  try {
    await checkNickname(nickname.value.trim()) // 200 OK이면 사용 가능
    nickOk.value = true
    nickMsg.value = '사용 가능한 닉네임입니다.'
  } catch (err) {
    if (err?.response?.status === 409) {
      nickOk.value = false
      nickMsg.value = err.response?.data || '이미 사용 중인 닉네임입니다.'
    } else {
      nickOk.value = false
      nickMsg.value = '확인 중 오류가 발생했습니다.'
    }
  } finally {
    isCheckingNick.value = false
  }
}

async function submitSignup() {
  // 1) 필수값
  if (!email.value || !nickname.value || !password.value || !confirmPassword.value) {
    alert('필수 정보를 모두 입력해주세요.')
    return
  }
  // 2) 형식/정책
  if (!emailValid.value) {
    alert('이메일 형식이 올바르지 않습니다.')
    return
  }
  if (!nicknameValid.value) {
    alert('닉네임은 2~20자로 입력해주세요.')
    return
  }
  if (password.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }
  // 3) 약관 동의
  if (!terms.value.privacy || !terms.value.property || !terms.value.usage) {
    alert('필수 약관에 모두 동의해주세요.')
    return
  }
  // 4) 마케팅 수신 동의 여부
  if (consentNotification.value === null) {
    alert('마케팅 알림 수신 동의를 선택해주세요.')
    return
  }
  // 5) (선택) 중복확인 강제
  if (emailOk.value !== true) {
    alert('이메일 중복확인을 완료해주세요.')
    return
  }
  if (nickOk.value !== true) {
    alert('닉네임 중복확인을 완료해주세요.')
    return
  }

  const sessionId = sessionStorage.getItem('verifySessionId')
  if (!sessionId) {
    alert('본인인증이 만료되었거나 수행되지 않았습니다. 다시 인증해주세요.')
    return
  }

  const payload = {
    email: email.value.trim(),
    nickname: nickname.value.trim(),
    password: password.value,
    sessionId,
  }

  isSubmitting.value = true
  try {
    await signup(payload)
    // 성공 시 본인인증 세션은 서버에서 삭제됨
    sessionStorage.removeItem('verifySessionId')
    sessionStorage.removeItem('verified')
    alert('회원가입이 완료되었습니다. 로그인해 주세요.')
    router.push('/auth/login')
  } catch (err) {
    const status = err?.response?.status
    const msg =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      '회원가입 중 오류가 발생했습니다.'
    alert(msg)
    // 만료/부재 케이스 핸들링
    if (status === 400 || status === 409) {
      // 400: 세션 ID 없음/요청값 오류, 409: 중복 등
    } else if (status === 500) {
      // 서버 처리 오류
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 왼쪽 이미지 영역 -->
    <div class="w-1/2 h-full">
      <img
        src="/src/assets/signup_image.png"
        alt="회원가입 이미지"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- 오른쪽 회원가입 영역 -->
    <div class="signup-container">
      <div class="signup-content wider-content">
        <!-- 로고 -->
        <div class="logo-container">
          <img src="../../assets/logo.png" alt="ZangBu 로고" class="logo-image" />
        </div>

        <h2 class="text-2xl font-bold mb-4">회원가입</h2>

        <div class="input-container">
          <!-- 이메일 -->
          <div class="input-group">
            <label class="input-label">이메일 <span class="text-red-500">*</span></label>
            <div class="input-row">
              <input
                v-model="email"
                type="email"
                placeholder="이메일을 입력하세요"
                class="input-field"
                :class="{ 'is-ok': emailOk === true, 'is-error': emailOk === false }"
              />
              <button
                type="button"
                class="check-btn"
                :disabled="isCheckingEmail || !email"
                @click="onCheckEmail"
              >
                {{ isCheckingEmail ? '확인중...' : '중복확인' }}
              </button>
            </div>
            <p class="field-help" :class="{ ok: emailOk === true, error: emailOk === false }">
              {{ emailMsg }}
            </p>
          </div>

          <!-- 닉네임 -->
          <div class="input-group">
            <label class="input-label">닉네임 <span class="text-red-500">*</span></label>
            <div class="input-row">
              <input
                v-model="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                class="input-field"
                :class="{ 'is-ok': nickOk === true, 'is-error': nickOk === false }"
              />
              <button
                type="button"
                class="check-btn"
                :disabled="isCheckingNick || !nickname"
                @click="onCheckNickname"
              >
                {{ isCheckingNick ? '확인중...' : '중복확인' }}
              </button>
            </div>
            <p class="field-help" :class="{ ok: nickOk === true, error: nickOk === false }">
              {{ nickMsg }}
            </p>
          </div>

          <!-- 비밀번호 -->
          <div class="input-group">
            <label class="input-label">비밀번호 <span class="text-red-500">*</span></label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="비밀번호를 입력하세요 (최소 8자)"
                class="input-field pr-10"
              />
              <span
                class="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
          </div>

          <!-- 비밀번호 확인 -->
          <div class="input-group">
            <label class="input-label">비밀번호 확인 <span class="text-red-500">*</span></label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="비밀번호를 다시 입력하세요"
                class="input-field pr-10"
              />
              <span
                class="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
          </div>

          <!-- 마케팅 알림 수신 동의 -->
          <div class="input-group mt-8">
            <label class="input-label">
              서비스/마케팅 알림 수신 동의 <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-1">
                <input
                  type="radio"
                  name="marketing"
                  class="accent-green-500"
                  :value="true"
                  v-model="consentNotification"
                />
                <span class="text-green-600 font-medium">동의</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  type="radio"
                  name="marketing"
                  class="accent-red-500"
                  :value="false"
                  v-model="consentNotification"
                />
                <span class="text-red-500 font-medium">거부</span>
              </label>
            </div>
          </div>

          <!-- 약관 동의 -->
          <div class="input-group mt-4">
            <label class="input-label block mb-2">
              약관 동의 <span class="text-red-500">*</span>
            </label>
            <div class="border rounded-lg divide-y divide-gray-200">
              <!-- 모두 동의 -->
              <label class="flex items-center p-3 gap-2">
                <input
                  type="checkbox"
                  v-model="allChecked"
                  @change="toggleAll"
                  class="accent-green-500"
                />
                <span>모두 동의</span>
              </label>

              <!-- 개인정보 처리방침 동의 -->
              <label class="flex items-center justify-between p-3 text-sm hover:bg-gray-50">
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="terms.privacy"
                    @change="checkIfAllAgreed"
                    class="accent-green-500"
                  />
                  <span class="text-gray-700">
                    개인정보 처리방침 동의 <span class="text-red-500">*</span>
                  </span>
                </div>
                <a href="#" class="text-green-600 font-medium hover:underline">보기</a>
              </label>

              <!-- 매물 관리 규정 동의 -->
              <label class="flex items-center justify-between p-3 text-sm hover:bg-gray-50">
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="terms.property"
                    @change="checkIfAllAgreed"
                    class="accent-green-500"
                  />
                  <span class="text-gray-700">
                    매물 관리 규정 동의 <span class="text-red-500">*</span>
                  </span>
                </div>
                <a href="#" class="text-green-600 font-medium hover:underline">보기</a>
              </label>

              <!-- 이용약관 동의 -->
              <label class="flex items-center justify-between p-3 text-sm hover:bg-gray-50">
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="terms.usage"
                    @change="checkIfAllAgreed"
                    class="accent-green-500"
                  />
                  <span class="text-gray-700">
                    이용약관 동의 <span class="text-red-500">*</span>
                  </span>
                </div>
                <a href="#" class="text-green-600 font-medium hover:underline">보기</a>
              </label>
            </div>
          </div>
        </div>

        <!-- 회원가입 버튼 -->
        <div class="button-container signup-botton">
          <button class="signup-button" @click="submitSignup">회원가입</button>
        </div>

        <!-- 로그인 링크 -->
        <div class="login-container">
          <router-link to="/auth/login" class="link">로그인으로 돌아가기</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-2);
  padding: 2.5rem 1.5rem;
}

.signup-content {
  width: 100%;
  max-width: 32rem;
  padding: 0;
  max-height: 95vh;
  overflow-y: auto;
}

.wider-content {
  max-width: 50rem;
}

.logo-container {
  display: flex;
  justify-content: flex-start;
  margin-left: -5%;
  margin-bottom: 1.25rem;
}

.logo-image {
  max-width: 35%;
}

.input-container {
  margin-bottom: 1.5rem;
}

.input-group {
  margin-bottom: 0.5rem;
  /* position: relative;  버튼 겹침 방지 위해 제거 */
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-1);
  margin-bottom: 0.25rem;
}

/* 인풋+버튼을 한 줄에 */
.input-row {
  display: grid;
  grid-template-columns: 1fr 108px; /* 인풋 가변, 버튼 고정 */
  gap: 8px;
  align-items: center;
}

.input-field {
  width: 100%;
  height: 44px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--brand-3);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: var(--brand-3);
  box-shadow: 0 0 0 2px rgba(104, 166, 60, 0.2);
}

/* 성공/에러 테두리 (선택사항) */
.input-field.is-ok {
  border-color: #2e7d32;
  box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.12);
}
.input-field.is-error {
  border-color: #d32f2f;
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.12);
}

/* 기존 absolute 사용하던 보정은 제거 */
.input-field.with-btn {
  padding-right: 1rem;
}

/* 오른쪽 중복확인 버튼 (absolute 아님) */
.check-btn {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--brand-3);
  border-radius: 8px;
  background: var(--brand-4);
  color: var(--text-3);
  cursor: pointer;
  white-space: nowrap;
}
.check-btn:hover {
  background: var(--brand-3);
}
.check-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-help {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.2;
}
.field-help.ok {
  color: #2e7d32;
} /* 성공 */
.field-help.error {
  color: #d32f2f;
} /* 실패/오류 */

.button-container {
  margin-bottom: 0.5rem;
}

.signup-button {
  width: 100%;
  background-color: var(--brand-4);
  color: var(--text-3);
  padding: 0.5rem 0;
  border: none;
  border-radius: 0.375rem;
  transition: background-color 0.3s;
}
.signup-button:hover {
  background-color: var(--brand-3);
}

.login-container {
  text-align: center;
  font-size: 0.875rem;
  color: var(--brand-3);
  margin-top: 0.25rem;
}

.link {
  text-decoration: none;
  color: var(--brand-3);
}
.link:hover {
  text-decoration: underline;
}
</style>
