<template>
  <div class="min-h-screen flex flex-col bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto flex flex-col flex-grow">
      <!-- 상단 폼 영역 -->
      <div class="flex-grow">
        <h2 class="text-xl font-semibold mb-6 text-center">본인인증을 진행해주세요</h2>

        <!-- 이름 -->
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm">
            이름 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="이름을 입력하세요"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>

        <!-- 주민등록번호 -->
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm">
            주민등록번호 <span class="text-red-500">*</span>
          </label>
          <div class="flex space-x-2">
            <input
              v-model="birth"
              type="text"
              placeholder="yymmdd"
              class="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
            />
            <input
              v-model="identity"
              type="password"
              placeholder="주민등록번호 뒤 7자리"
              class="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
            />
          </div>
        </div>

        <!-- 주민등록번호 발급일자 -->
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm">
            주민등록번호 발급일자 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="issueDate"
            type="text"
            placeholder="yyyymmdd"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>

        <!-- 통신사 -->
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm">
            통신사 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="telecom"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          >
            <option value="" disabled>통신사를 선택하세요</option>
            <option value="SKT">SKT</option>
            <option value="KT">KT</option>
            <option value="LGU+">LG U+</option>
            <option value="SKT알뜰폰">SKT 알뜰폰</option>
            <option value="KT알뜰폰">KT 알뜰폰</option>
            <option value="LGU+알뜰폰">LGU+ 알뜰폰</option>
          </select>
        </div>

        <!-- 전화번호 -->
        <div class="mb-6">
          <label class="block mb-1 font-medium text-sm">
            전화번호(하이픈 없이 입력) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="phone"
            type="text"
            placeholder="ex) 01012345678"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>

        <!-- 보안문자 입력: 인증하기 클릭 후 노출 -->
        <div v-if="showCaptcha" class="mt-6 pt-6 border-t">
          <label class="block mb-2 font-medium text-sm">
            보안문자 입력 <span class="text-red-500">*</span>
          </label>

          <div class="flex flex-col sm:flex-row gap-4 items-stretch">
            <!-- 캡차 이미지 (서버 URL 바인딩) -->
            <img
              v-if="captchaImageUrl"
              :src="captchaImageUrl"
              alt="captcha"
              class="w-full sm:w-[240px] h-20 rounded border border-gray-300 object-cover"
            />
            <!-- 우측: 입력 + 확인 버튼 -->
            <div class="flex-1 flex flex-col gap-2 sm:max-w-[260px]">
              <input
                v-model="captchaInput"
                type="text"
                placeholder="보안문자 입력"
                class="h-10 w-full px-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
                @keyup.enter="verifyCaptcha"
              />
              <button
                type="button"
                class="h-10 w-full bg-brand-4 hover:bg-brand-3 text-white rounded disabled:opacity-60"
                @click="verifyCaptcha"
                :disabled="loading"
              >
                {{ loading ? '로딩중...' : '확인' }}
              </button>
              <p v-if="captchaVerified" class="text-green-600 text-xs">보안문자 확인 완료</p>
            </div>
          </div>
        </div>

        <!-- 에러 -->
        <p v-if="errorMessage" class="text-red-500 text-sm mt-3 text-center">
          {{ errorMessage }}
        </p>
      </div>

      <!-- 하단 메인 버튼 -->
      <div class="w-full mt-6">
        <button
          type="button"
          @click="onPrimary"
          class="w-full bg-brand-4 hover:bg-brand-3 text-white py-2 rounded disabled:opacity-60"
          :disabled="loading || (showCaptcha && !captchaVerified) || verified"
        >
          {{ loading ? '인증 중...' : verified ? '인증완료' : showCaptcha ? '다음' : '인증하기' }}
        </button>
      </div>

      <!-- 비번 재설정 섹션 (비번찾기 모드 + 토큰 발급 성공 시 표시) -->
      <div v-if="showResetForm" class="mt-8 pt-6 border-t">
        <h3 class="text-base font-semibold mb-4">새 비밀번호 설정</h3>

        <div class="mb-3">
          <label class="block mb-1 text-sm font-medium">새 비밀번호</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="8자 이상, 영문/숫자 조합 권장"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium">새 비밀번호 확인</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
          />
        </div>

        <button
          type="button"
          class="w-full bg-brand-4 hover:bg-brand-3 text-white py-2 rounded disabled:opacity-60"
          @click="submitResetPassword"
          :disabled="loading"
        >
          {{ loading ? '변경 중...' : '비밀번호 변경하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  requestAuth,
  requestAuthStep2,
  sendVerify,
  verifyPassword,
  resetPasswordByToken,
} from '@/api/auth/auth'
import { encryptRsa } from '@/utils/rsa'

// 6자리 숫자 캡차 생성
function genDummyCaptcha(len = 6) {
  let s = ''
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10)
  return s
}

// "숫자"가 찍힌 SVG 이미지를 data URL로 변환
function makeCaptchaDataUrl(code) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80">
  <rect width="100%" height="100%" fill="#eeeeee"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="monospace" font-size="32" fill="#333333">${code}</text>
</svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

const route = useRoute()
const router = useRouter()
const mode = computed(() => (route.query.mode || 'signup').toString().toLowerCase())

// ⬇️ 추가: 비번 재설정 섹션 표시/토큰/입력 상태
const showResetForm = ref(false)
const verified = ref(false)
const resetToken = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const dummyCaptchaCode = ref('')

// 폼 상태
const name = ref('')
const birth = ref('')
const identity = ref('')
const issueDate = ref('')
const telecom = ref('')
const phone = ref('')

// 에러/캡차 상태
const errorMessage = ref('')
const showCaptcha = ref(false)
const captchaImageUrl = ref('')
const captchaInput = ref('')
const captchaVerified = ref(false)
const sessionKey = ref('')
const loading = ref(false)

function getTelecomCode(telecomValue) {
  if (telecomValue.includes('SKT')) return '0'
  if (telecomValue.includes('KT')) return '1'
  if (telecomValue.includes('LGU+')) return '2'
  return ''
}

// 더미 캡차를 강제로 표시 (즉시성공 케이스에서 사용)
function showDummyCaptcha() {
  sessionKey.value = 'DUMMY' // 더미 세션 표식
  dummyCaptchaCode.value = genDummyCaptcha(6)
  setCaptchaImage(makeCaptchaDataUrl(dummyCaptchaCode.value))
  showCaptcha.value = true
  captchaVerified.value = false
  captchaInput.value = ''
}

// base64 string → data:image/png;base64 변환 (URL-safe/패딩 보정 포함)
function toPngDataUrlFromBase64(raw) {
  if (!raw) return ''
  let b64 = String(raw).trim()
  if (b64.startsWith('data:')) return b64
  // URL 인코딩 보정
  if (/%[0-9A-Fa-f]{2}/.test(b64)) {
    try {
      b64 = decodeURIComponent(b64)
    } catch {}
  }
  // url-safe → 표준 base64
  b64 = b64.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/')
  // 패딩 보정
  const pad = b64.length % 4
  if (pad) b64 += '='.repeat(4 - pad)
  return `data:image/png;base64,${b64}`
}

// 안전하게 data URL만 허용
function setCaptchaImage(raw) {
  if (!raw) {
    captchaImageUrl.value = ''
    return
  }
  const url = toPngDataUrlFromBase64(raw)

  // 절대 서버 URL 허용 금지
  if (/^https?:\/\//i.test(raw) || /^https?:\/\//i.test(url)) {
    console.warn('[CAPTCHA] URL blocked:', raw)
    captchaImageUrl.value = ''
    errorMessage.value = '캡차 이미지를 불러오지 못했습니다.'
    return
  }
  if (!url.startsWith('data:image/')) {
    console.warn('[CAPTCHA] Not a data URL. Blocking:', url)
    captchaImageUrl.value = ''
    errorMessage.value = '캡차 이미지를 불러오지 못했습니다.'
    return
  }
  captchaImageUrl.value = url
}

function safeParseResponse(respData) {
  // 이미 객체면 그대로
  if (respData && typeof respData === 'object') return respData

  // 문자열이면 디코드 → JSON 파싱 시도
  if (typeof respData === 'string') {
    let s = respData.trim()
    // URL 인코딩된 경우 대비
    try {
      if (/%[0-9A-Fa-f]{2}/.test(s)) s = decodeURIComponent(s)
    } catch {}
    // JSON 파싱
    try {
      return JSON.parse(s)
    } catch {}
  }
  return null
}

/** /auth/verify 로 보낼 페이로드 (백엔드 DTO와 동일 키) */
function buildVerifyPayload() {
  return {
    name: name.value,
    birth: birth.value,
    identity: encryptRsa(identity.value), // 암호화 그대로 전송
    phone: phone.value.replace(/[^0-9]/g, ''),
    telecom: getTelecomCode(telecom.value),
    issueDate: issueDate.value,

    sessionKey: sessionKey.value || null,
    captchaVerified: !!captchaVerified.value,
  }
}

/** 최종: /auth/verify 저장 → sessionId 받아서 보관 → 다음 이동 */
async function finalizeVerificationAndGoNext() {
  try {
    const payload = buildVerifyPayload()

    if (mode.value === 'password') {
      // 1) 사용자 존재 확인 + resetToken 발급
      const { data } = await verifyPassword(payload)
      // const isValid = data?.isValid
      // const token = data?.resetToken
      const isValid = (data?.isValid ?? data?.valid ?? data?.isValidUser) === true
      const token = data?.resetToken ?? data?.token

      if (!isValid) {
        errorMessage.value = '해당 정보와 일치하는 회원이 없습니다.'
        return
      }
      if (!token) {
        errorMessage.value = '재설정 토큰 발급에 실패했습니다.'
        return
      }

      // 2) 같은 페이지에서 비번 재설정 폼 표시
      resetToken.value = token
      showResetForm.value = true
      verified.value = true
      return
    }

    // === 회원가입 모드 그대로 유지 ===
    const { data } = await sendVerify(payload)
    const sessionId = data?.sessionId || data?.id
    if (!sessionId) throw new Error('세션 아이디를 받지 못했습니다.')
    sessionStorage.setItem('verified', 'true')
    sessionStorage.setItem('verifySessionId', String(sessionId))
    router.push('/auth/signup')
  } catch (e) {
    errorMessage.value =
      e?.response?.data?.message ||
      e?.response?.data ||
      e?.message ||
      '인증 결과 저장에 실패했습니다.'
  }
}

// 1단계: 본인인증 제출 -> 분기(즉시성공 / 재인증 / 캡차)
async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true

  if (
    !name.value ||
    !birth.value ||
    !identity.value ||
    !issueDate.value ||
    !telecom.value ||
    !phone.value
  ) {
    errorMessage.value = '모든 필수 항목을 입력해주세요.'
    loading.value = false
    return
  }

  try {
    const payload = {
      name: name.value,
      birth: birth.value,
      identity: encryptRsa(identity.value),
      issueDate: issueDate.value,
      telecom: getTelecomCode(telecom.value),
      phone: phone.value.replace(/[^0-9]/g, ''),
    }

    const { data } = await requestAuth(payload)
    const parsed = safeParseResponse(data) || {}

    const resultCode = parsed?.resultCode ?? parsed?.result?.code ?? null
    const resAuth = parsed?.data?.resAuthenticity ?? parsed?.resAuthenticity ?? null

    // ── A) 즉시 성공 (resAuthenticity==1 또는 resultCode==CF-00000)
    if (String(resAuth) === '1' || resultCode === 'CF-00000') {
      // showCaptcha.value = false
      // captchaVerified.value = true
      // await finalizeVerificationAndGoNext() // ← 바로 /auth/verify 저장 후 이동
      // return

      // 2차 인증 UX 유지: 더미 캡차를 강제 노출
      showDummyCaptcha()
      return
    }

    // ── B) 캡차 흐름 (sessionKey+captcha 제공 시)
    const sess =
      parsed?.sessionKey ||
      parsed?.data?.sessionKey ||
      parsed?.data?.jti ||
      parsed?.result?.transactionId ||
      ''

    const rawCaptcha =
      parsed?.captcha || parsed?.data?.extraInfo?.reqSecureNo || parsed?.data?.captcha || ''

    if (sess && rawCaptcha) {
      sessionKey.value = String(sess).trim()
      setCaptchaImage(rawCaptcha)
      showCaptcha.value = !!captchaImageUrl.value
      captchaVerified.value = false
      if (!showCaptcha.value) {
        errorMessage.value = '캡차를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
      }
      return
    }

    // ── C) 그 외: 재인증 필요(캡차 아님) 또는 정의되지 않은 상태
    errorMessage.value =
      parsed?.message ||
      parsed?.data?.resAuthenticityDesc ||
      '인증에 실패했습니다. 다시 시도해주세요.'
    showCaptcha.value = false
    captchaVerified.value = false
  } catch (e) {
    // 서버가 재인증 필요를 409로 내려주는 경우 등
    const resp = e?.response?.data
    const parsed = safeParseResponse(resp) || {}
    errorMessage.value =
      parsed?.message ||
      parsed?.data?.resAuthenticityDesc ||
      e?.response?.data?.message ||
      '본인인증 요청 실패'
    showCaptcha.value = false
    captchaVerified.value = false
  } finally {
    loading.value = false
  }
}

// 2단계: 보안문자 확인
async function verifyCaptcha() {
  if (!captchaInput.value?.trim()) {
    errorMessage.value = '보안문자를 입력해주세요.'
    return
  }
  if (!sessionKey.value) {
    errorMessage.value = '세션키가 없습니다. 인증을 다시 시도해주세요.'
    return
  }

  // DUMMY 모드: API 호출 없이 고정 코드와 일치 비교
  if (sessionKey.value === 'DUMMY') {
    const input = captchaInput.value.replace(/\D/g, '')
    if (input === dummyCaptchaCode.value) {
      captchaVerified.value = true
      errorMessage.value = ''
    } else {
      captchaVerified.value = false
      errorMessage.value = '보안문자가 일치하지 않습니다.'
    }
    return
  }

  loading.value = true
  try {
    const payload = {
      sessionKey: String(sessionKey.value).trim(),
      secureNo: captchaInput.value.replace(/\D/g, ''),
    }
    const { data } = await requestAuthStep2(payload)
    const parsed = safeParseResponse(data) || {}

    // 성공 판정: (A) resAuthenticity == '1'  또는  (B) resultCode == 'CF-00000'
    const ok =
      String(parsed?.resAuthenticity ?? parsed?.data?.resAuthenticity ?? '') === '1' ||
      parsed?.resultCode === 'CF-00000'

    captchaVerified.value = !!ok
    errorMessage.value = ok
      ? ''
      : parsed?.resAuthenticityDesc || parsed?.message || '보안문자 확인에 실패하였습니다.'
  } catch (e) {
    const parsed = safeParseResponse(e?.response?.data) || {}
    captchaVerified.value = false
    errorMessage.value =
      parsed?.resAuthenticityDesc ||
      parsed?.message ||
      e?.response?.data?.message ||
      '보안문자 확인 실패'
  } finally {
    loading.value = false
  }
}

async function submitResetPassword() {
  if (!resetToken.value) {
    errorMessage.value = '재설정 토큰이 없습니다. 다시 시도해주세요.'
    return
  }
  if (!newPassword.value || newPassword.value.length < 8) {
    errorMessage.value = '비밀번호는 8자 이상이어야 합니다.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  loading.value = true
  try {
    await resetPasswordByToken({ token: resetToken.value, newPassword: newPassword.value })
    alert('비밀번호가 변경되었습니다. 다시 로그인 해주세요.')
    router.push('/auth/login')
  } catch (e) {
    errorMessage.value = e?.response?.data || '비밀번호 변경에 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 하단 메인 버튼
async function onPrimary() {
  if (loading.value) return
  if (!showCaptcha.value) {
    await handleSubmit()
  } else if (captchaVerified.value) {
    // 2차까지 성공 후 '다음'에서 /auth/verify 저장 → 이동
    await finalizeVerificationAndGoNext()
  }
}
</script>
