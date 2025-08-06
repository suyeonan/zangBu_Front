import api from '../axios'

/**
 * 보안문자 인증 API
 * @param {Object} data - 요청 데이터
 * @param {string} data.sessionKey - 세션 키
 * @param {string} data.secureNo - 보안번호
 * @returns {Promise} API 응답
 */
export const verifySecureCode = (data) => {
  return api.post('/codef/secure', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 건물 일련번호 조회 API
 * @param {Object} data - 요청 데이터
 * @param {string} data.addrSido - 시도
 * @param {string} data.addrSigun - 시군구
 * @param {string} data.addrDong - 동
 * @param {string} data.buildingName - 건물명
 * @returns {Promise} API 응답
 */
export const getComplexNo = (data) => {
  return api.post('/codef/complex', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 보안문자 인증 (토큰 포함)
 * @param {Object} data - 요청 데이터
 * @param {string} data.sessionKey - 세션 키
 * @param {string} data.secureNo - 보안번호
 * @param {string} accessToken - 액세스 토큰
 * @returns {Promise} API 응답
 */
export const verifySecureCodeWithToken = (data, accessToken) => {
  return api.post('/codef/secure', data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 건물 일련번호 조회 (토큰 포함)
 * @param {Object} data - 요청 데이터
 * @param {string} data.addrSido - 시도
 * @param {string} data.addrSigun - 시군구
 * @param {string} data.addrDong - 동
 * @param {string} data.buildingName - 건물명
 * @param {string} accessToken - 액세스 토큰
 * @returns {Promise} API 응답
 */
export const getComplexNoWithToken = (data, accessToken) => {
  return api.post('/codef/complex', data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}
