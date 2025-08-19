import api from '../axios'

// 1. 로그인
export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

// 2. 로그아웃
export const logout = () => {
  const token = localStorage.getItem('token')
  return api.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${token}` } // 강제 부착 (디버깅용)
  })
}

// 3. 아이디 찾기
export const findId = (payload) => {
  return api.post('/auth/email', payload)
}

// 4. 비밀번호 재설정
export const findPassword = (email) => {
  return api.post('/auth/password', { email })
}

//5. 본인인증 요청
//1) 1단계
// export const requestAuth = (payload) => {
//   return api.post('/codef/captcha', payload)
// }
// //2) 2단계
// export const requestAuthStep2 = (payload) => {
//   return api.post('/codef/secure', payload)
// }

const LONG_TIMEOUT = 120_000; // 120초 (CODEF 2-Way 대기 고려)
const parseMaybeJson = (data) => {
  if (data == null) return data;
  if (typeof data === 'object') return data;
  const s = String(data).trim();
  try { return JSON.parse(s); } catch { return s; }
};

// 1) 1단계: 캡차 세션 발급
export const requestAuth = (payload = {}) => {
  return api.post('/codef/captcha', payload, {
    timeout: LONG_TIMEOUT,
    withCredentials: true,
  });
};

// 2) 2단계: 보안문자 확인
//   백엔드 엔드포인트가 '/codef/secure' 라면 그대로 사용.
//   만약 '/codef/captcha/verify' 라면 아래 경로만 바꿔주세요.
export const requestAuthStep2 = (payload = {}) => {
  return api.post('/codef/secure', payload, {
    timeout: LONG_TIMEOUT,
    withCredentials: true,
  });
};

// //비밀번호 재설정 시 회원이 실제 있는지 확인
// export const verifyPassword = (payload) => {
//   return api.post('/auth/verify/password', payload)
// }

export const verifyPassword = (payload) =>
  api.post('/auth/verify/password', payload, {
    timeout: 120000,
    // withCredentials: true, // 필요 없으면 생략
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    transformRequest: [(data) => JSON.stringify(data)],
  });

// export const verifyPassword = (payload) => {
//   return api.post('/auth/verify/password', payload, {
//     timeout: LONG_TIMEOUT,
//     withCredentials: true,
//   });
// };

  // ✅ 토큰 기반 비밀번호 재설정
export const resetPasswordByToken = (payload) => {
    // payload: { token, newPassword }
  return api.post('/auth/password/reset', payload)
}

// 6. 회원가입
export const signup = (payload = {}) => {
  return api.post('/auth/signup', payload, {
    timeout: LONG_TIMEOUT,
    withCredentials: true,
  });
};


// 7. 이메일 중복 확인
export const checkEmail = (email) => {
  return api.post('/auth/check/email', { email })
}

// 8. 닉네임 중복 확인
export const checkNickname = (nickname) => {
  return api.post('/auth/check/nickname', { nickname })
}

// 9. 토큰 갱신
export const refreshToken = () => {
  return api.post('/auth/reissue')
}

//본인인증 완료된 값 넘기기
export const sendVerify = (payload) => {
  return api.post('/auth/verify', payload)
}