/**
 * 숫자에 콤마 추가하는 함수
 * @param {string|number} value - 포맷팅할 값
 * @returns {string} 콤마가 추가된 문자열
 */
export const formatNumber = (value) => {
  if (!value) return ''
  const numericValue = value.toString().replace(/[^\d]/g, '')
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 콤마 제거하고 숫자만 반환하는 함수
 * @param {string} value - 콤마가 포함된 문자열
 * @returns {string} 숫자만 포함된 문자열
 */
export const removeCommas = (value) => {
  if (!value) return ''
  return value.toString().replace(/,/g, '')
}

/**
 * 면적 포맷팅 함수 (소수점 첫째자리까지만 허용)
 * @param {string} value - 포맷팅할 면적 값
 * @returns {string} 포맷팅된 면적 값
 */
export const formatArea = (value) => {
  if (!value) return ''
  let numericValue = value.toString().replace(/[^\d.]/g, '')

  if (numericValue.startsWith('.')) {
    numericValue = numericValue.substring(1)
  }

  const dotIndex = numericValue.indexOf('.')
  if (dotIndex !== -1) {
    const beforeDot = numericValue.substring(0, dotIndex)
    const afterDot = numericValue.substring(dotIndex + 1).replace(/\./g, '')
    const limitedAfterDot = afterDot.substring(0, 1)
    return beforeDot + '.' + limitedAfterDot
  }

  return numericValue
}

/**
 * 전화번호 포맷팅 함수
 * @param {string} value - 포맷팅할 전화번호
 * @returns {string} 하이픈이 추가된 전화번호
 */
export const formatPhoneNumber = (value) => {
  if (!value) return ''
  const numbers = value.replace(/[^\d]/g, '')
  const limitedNumbers = numbers.substring(0, 11)

  if (limitedNumbers.length <= 3) {
    return limitedNumbers
  } else if (limitedNumbers.length <= 7) {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
  } else {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`
  }
}

/**
 * 담당자 이름 포맷팅 (한글, 영어만 허용)
 * @param {string} value - 포맷팅할 이름
 * @returns {string} 한글, 영어만 포함된 이름
 */
export const formatContactName = (value) => {
  if (!value) return ''
  return value.replace(/[^가-힣a-zA-Z\s]/g, '')
}

/**
 * 숫자만 허용하는 포맷팅 함수
 * @param {string} value - 포맷팅할 값
 * @returns {string} 숫자만 포함된 문자열
 */
export const formatNumberOnly = (value) => {
  if (!value) return ''
  return value.replace(/[^0-9]/g, '')
}
