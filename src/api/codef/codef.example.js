import {
  verifySecureCode,
  getComplexNo,
  verifySecureCodeWithToken,
  getComplexNoWithToken,
} from './codef.js'

/**
 * 보안문자 인증 예제
 */
export const exampleVerifySecureCode = async () => {
  try {
    const data = {
      sessionKey: 'your-session-key',
      secureNo: 'your-secure-number',
    }

    const response = await verifySecureCode(data)

    if (response.status === 200) {
      console.log('보안문자 인증에 성공하였습니다.')
      return response.data
    } else if (response.status === 404) {
      console.log('보안문자 인증에 실패했습니다.')
    } else if (response.status === 500) {
      console.log('서버에서 보안 문자 인증을 처리하는데 오류가 발생했습니다.')
    }
  } catch (error) {
    console.error('보안문자 인증 오류:', error)
  }
}

/**
 * 건물 일련번호 조회 예제
 */
export const exampleGetComplexNo = async () => {
  try {
    const data = {
      addrSido: '서울특별시',
      addrSigun: '송파구',
      addrDong: '방이동',
      buildingName: '송파더센트레',
    }

    const response = await getComplexNo(data)

    if (response.status === 200) {
      console.log('건물 일련번호를 찾는데 성공하였습니다.')
      console.log('Complex No:', response.data.complexNo)
      return response.data
    } else if (response.status === 404) {
      console.log('건물 일련번호를 찾는데 실패했습니다.')
    } else if (response.status === 500) {
      console.log('서버에서 건물 일련번호를 처리하는데 오류가 발생했습니다.')
    }
  } catch (error) {
    console.error('건물 일련번호 조회 오류:', error)
  }
}

/**
 * 토큰을 포함한 보안문자 인증 예제
 */
export const exampleVerifySecureCodeWithToken = async (accessToken) => {
  try {
    const data = {
      sessionKey: 'your-session-key',
      secureNo: 'your-secure-number',
    }

    const response = await verifySecureCodeWithToken(data, accessToken)

    if (response.status === 200) {
      console.log('보안문자 인증에 성공하였습니다.')
      return response.data
    }
  } catch (error) {
    console.error('보안문자 인증 오류:', error)
  }
}

/**
 * 토큰을 포함한 건물 일련번호 조회 예제
 */
export const exampleGetComplexNoWithToken = async (accessToken) => {
  try {
    const data = {
      addrSido: '서울특별시',
      addrSigun: '송파구',
      addrDong: '방이동',
      buildingName: '송파더센트레',
    }

    const response = await getComplexNoWithToken(data, accessToken)

    if (response.status === 200) {
      console.log('건물 일련번호를 찾는데 성공하였습니다.')
      console.log('Complex No:', response.data.complexNo)
      return response.data
    }
  } catch (error) {
    console.error('건물 일련번호 조회 오류:', error)
  }
}
