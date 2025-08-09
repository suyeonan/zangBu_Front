<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCodefStore } from '@/stores/codef/codef'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'
import RadioGroup from '@/components/common/RadioGroup.vue'
import PropertyTypeSelector from './PropertyTypeSelector.vue'
import PriceInput from './PriceInput.vue'
import AddressSearch from './AddressSearch.vue'
import AreaInput from './AreaInput.vue'
import { formatNumber, removeCommas, formatNumberOnly, formatArea } from '@/utils/formatters'

// Props 정의
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      registrantType: 'owner',
      propertyType: 'sale',
      price: '',
      deposit: '',
      buildingType: 'house',
      buildingName: '',
      roadAddress: '',
      detailAddress: '',
      buildingDong: '', // 동 정보
      buildingHo: '', // 호수 정보
      buildingName: '', // 건물명
      complexNo: '', // 건물 일련번호
      area: '',
      moveInType: 'immediate',
      moveInDate: '',
      // 주소 관련 추가 필드
      sido: '',
      sigungu: '',
      siCode: '',
      eupmyeondong: '',
      zonecode: '',
      bname: '',
      // 가공된 주소 필드
      addrSido: '',
      addrSigun: '',
      addrDong: '',
    }),
  },
})

// Emits 정의
const emit = defineEmits(['update:modelValue'])

// 옵션 데이터
const registrantTypeOptions = [
  { value: 'owner', label: '집주인' },
  { value: 'tenant', label: '세입자' },
]

const propertyTypeOptions = [
  { value: 'sale', label: '매매' },
  { value: 'jeonse', label: '전세' },
  { value: 'monthly', label: '월세' },
]

const buildingTypeOptions = [
  { value: 'apartment', label: '아파트' },
  { value: 'officetel', label: '오피스텔' },
  { value: 'villa', label: '연립' },
  { value: 'house', label: '주택' },
]

const moveInTypeOptions = [
  { value: 'immediate', label: '즉시 입주' },
  { value: 'date', label: '입주 날짜 선택' },
  { value: 'negotiable', label: '협의 가능' },
]

// 폼 데이터
const formData = ref({
  registrantType: props.modelValue.registrantType || 'owner',
  propertyType: props.modelValue.propertyType || 'sale',
  price: props.modelValue.price || '',
  deposit: props.modelValue.deposit || '',
  buildingType: props.modelValue.buildingType || 'house',
  buildingName: props.modelValue.buildingName || '',
  roadAddress: props.modelValue.roadAddress || '',
  detailAddress: props.modelValue.detailAddress || '',
  buildingDong: props.modelValue.buildingDong || '', // 동 정보
  buildingHo: props.modelValue.buildingHo || '', // 호수 정보
  buildingName: props.modelValue.buildingName || '', // 건물명
  complexNo: props.modelValue.complexNo || '', // 건물 일련번호
  area: props.modelValue.area || '',
  moveInType: props.modelValue.moveInType || 'immediate',
  moveInDate: props.modelValue.moveInDate || '',
  // 주소 관련 추가 필드
  sido: props.modelValue.sido || '',
  sigungu: props.modelValue.sigungu || '',
  siCode: props.modelValue.siCode || '',
  eupmyeondong: props.modelValue.eupmyeondong || '',
  zonecode: props.modelValue.zonecode || '',
  bname: props.modelValue.bname || '',
  // 가공된 주소 필드
  addrSido: props.modelValue.addrSido || '',
  addrSigun: props.modelValue.addrSigun || '',
  addrDong: props.modelValue.addrDong || '',
})

// props 변경 감지
watch(
  () => props.modelValue,
  (newValue) => {
    formData.value = {
      registrantType: newValue.registrantType || 'owner',
      propertyType: newValue.propertyType || 'sale',
      price: newValue.price || '',
      deposit: newValue.deposit || '',
      buildingType: newValue.buildingType || 'house',
      buildingName: newValue.buildingName || '',
      roadAddress: newValue.roadAddress || '',
      detailAddress: newValue.detailAddress || '',
      buildingDong: newValue.buildingDong || '', // 동 정보
      buildingHo: newValue.buildingHo || '', // 호수 정보
      buildingName: newValue.buildingName || '', // 건물명
      complexNo: newValue.complexNo || '', // 건물 일련번호
      area: newValue.area || '',
      moveInType: newValue.moveInType || 'immediate',
      moveInDate: newValue.moveInDate || '',
      // 주소 관련 추가 필드
      sido: newValue.sido || '',
      sigungu: newValue.sigungu || '',
      siCode: newValue.siCode || '',
      eupmyeondong: newValue.eupmyeondong || '',
      zonecode: newValue.zonecode || '',
      bname: newValue.bname || '',
      // 가공된 주소 필드
      addrSido: newValue.addrSido || '',
      addrSigun: newValue.addrSigun || '',
      addrDong: newValue.addrDong || '',
    }
  },
  { deep: true }
)

// 함수들은 utils/formatters.js에서 import하여 사용

// 면적 입력 처리
const handleAreaInput = (event) => {
  const value = event.target.value
  const formattedValue = formatArea(value)

  // 포맷된 값으로 입력 필드 업데이트
  event.target.value = formattedValue
  formData.value.area = formattedValue
  emit('update:modelValue', { ...formData.value })
}

// 가격 입력 처리
const handlePriceInput = (event) => {
  const value = event.target.value
  const formattedValue = formatNumber(value)

  // 포맷된 값으로 입력 필드 업데이트
  event.target.value = formattedValue
  formData.value.price = formattedValue
  emit('update:modelValue', { ...formData.value })
}

// 가격 입력 키 제한 (숫자만 허용)
const handlePriceKeypress = (event) => {
  const char = String.fromCharCode(event.which)

  // 숫자가 아닌 경우 입력 차단
  if (!/\d/.test(char)) {
    event.preventDefault()
    return
  }
}

// 보증금 입력 처리
const handleDepositInput = (event) => {
  const value = event.target.value
  const formattedValue = formatNumber(value)

  // 포맷된 값으로 입력 필드 업데이트
  event.target.value = formattedValue
  formData.value.deposit = formattedValue
  emit('update:modelValue', { ...formData.value })
}

// 동 입력 처리
const handleDongInput = (event) => {
  const value = event.target.value.replace(/[^\d]/g, '') // 숫자만 허용
  event.target.value = value
  formData.value.buildingDong = value
  emit('update:modelValue', { ...formData.value })
}

// 호수 입력 처리
const handleHoInput = (event) => {
  const value = event.target.value.replace(/[^\d]/g, '') // 숫자만 허용
  event.target.value = value
  formData.value.buildingHo = value
  emit('update:modelValue', { ...formData.value })
}

// 숫자 입력 키 제한 (숫자만 허용)
const handleNumberKeypress = (event) => {
  const char = String.fromCharCode(event.which)

  // 숫자가 아닌 경우 입력 차단
  if (!/\d/.test(char)) {
    event.preventDefault()
    return
  }
}

// 면적 입력 키 제한 (숫자와 소수점만 허용)
const handleAreaKeypress = (event) => {
  const char = String.fromCharCode(event.which)
  const currentValue = event.target.value

  // 숫자가 아니고 소수점도 아닌 경우 입력 차단
  if (!/[\d.]/.test(char)) {
    event.preventDefault()
    return
  }

  // 이미 소수점이 있는데 또 소수점을 입력하려는 경우 차단
  if (char === '.' && currentValue.includes('.')) {
    event.preventDefault()
    return
  }

  // 소수점 이후 이미 한 자리가 있는데 더 입력하려는 경우 차단
  if (currentValue.includes('.')) {
    const afterDot = currentValue.split('.')[1]
    if (afterDot && afterDot.length >= 1 && /\d/.test(char)) {
      event.preventDefault()
      return
    }
  }
}

// 가격 유효성 검사
const priceError = computed(() => {
  if (!formData.value.price) return ''
  const price = parseInt(removeCommas(formData.value.price))
  if (price > 4000000000) {
    return '매매가는 40억 원을 초과할 수 없습니다'
  }
  return ''
})

// 데이터 변경 시 부모에게 전달
const updateFormData = (field, value) => {
  // 가격과 보증금 필드는 콤마 포맷팅 적용
  if (field === 'price' || field === 'deposit') {
    const formattedValue = formatNumber(value)
    formData.value[field] = formattedValue
  } else if (field === 'area') {
    // 면적 필드는 소수점 첫째자리까지만 허용
    const formattedValue = formatArea(value)
    formData.value[field] = formattedValue
  } else {
    formData.value[field] = value
  }
  emit('update:modelValue', { ...formData.value })
}

// 면적 전용 업데이트 함수
const updateAreaValue = (value) => {
  const formattedValue = formatArea(value)
  formData.value.area = formattedValue
  emit('update:modelValue', { ...formData.value })
}

// Daum 우편번호 API 로드
let daumPostcode = null

// 주소 기반 제안 정보
const suggestions = ref({
  dong: [],
  ho: [],
  area: [],
})

// 제안 정보 표시 여부
const showSuggestions = ref(false)

onMounted(() => {
  // Daum 우편번호 API 스크립트 로드
  const script = document.createElement('script')
  script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
  script.onload = () => {
    daumPostcode = window.daum?.Postcode
  }
  document.head.appendChild(script)
})

// CODEF store 초기화
const codefStore = useCodefStore()

// 부동산 유형 자동 설정
const setBuildingType = (addressData) => {
  let buildingType = 'house' // 기본값

  // apartment 필드로 공동주택 여부 판단
  if (addressData.apartment === 'Y') {
    // 건물명으로 더 세부적인 유형 판단
    const buildingName = addressData.buildingName || ''

    if (buildingName.includes('아파트') || buildingName.includes('APT')) {
      buildingType = 'apartment'
    } else if (buildingName.includes('오피스텔') || buildingName.includes('OFFICETEL')) {
      buildingType = 'officetel'
    } else if (
      buildingName.includes('빌라') ||
      buildingName.includes('연립') ||
      buildingName.includes('다세대')
    ) {
      buildingType = 'villa'
    } else {
      // 공동주택이지만 구체적인 유형을 알 수 없는 경우 아파트로 기본 설정
      buildingType = 'apartment'
    }
  } else {
    // 공동주택이 아닌 경우 주택으로 설정
    buildingType = 'house'
  }

  console.log(
    '부동산 유형 자동 설정:',
    buildingType,
    '(건물명:',
    addressData.buildingName,
    ', 공동주택:',
    addressData.apartment,
    ')'
  )
  updateFormData('buildingType', buildingType)
}

// 실제 부동산 정보 API 호출
const fetchRealEstateInfo = async (addressData) => {
  try {
    const buildingName = addressData.buildingName || ''
    const sido = addressData.sido || ''
    const sigungu = addressData.sigungu || ''
    const eupmyeondong = addressData.eupmyeondong || addressData.bname

    if (!buildingName || !sido || !sigungu) {
      console.log('부동산 정보 조회를 위한 필수 정보가 부족합니다.')
      return getDefaultSuggestions(addressData)
    }

    console.log('🏢 실제 부동산 정보 조회 시작:', { buildingName, sido, sigungu, eupmyeondong })

    // 실제 부동산 정보 API 호출
    const { fetchBuildingInfo } = await import('@/api/real-estate/real-estate')

    const result = await fetchBuildingInfo({
      buildingName: buildingName.trim(),
      sido: sido.trim(),
      sigungu: sigungu.trim(),
      eupmyeondong: eupmyeondong.trim(),
      roadAddress: addressData.roadAddress,
    })

    if (result.success) {
      console.log('✅ 실제 부동산 정보 조회 성공:', result.data)

      return {
        dong: result.data.availableDong || [],
        ho: result.data.availableHo || [],
        area: result.data.availableArea || [],
        isRealData: true,
        buildingInfo: result.data.buildingInfo || null,
        dataSource: result.data.dataSource,
      }
    } else {
      console.log('❌ 실제 부동산 정보 조회 실패:', result.message)
      return getDefaultSuggestions(addressData)
    }
  } catch (error) {
    console.error('🚨 실제 부동산 정보 조회 중 오류:', error)
    return getDefaultSuggestions(addressData)
  }
}

// 기본 추정 정보 제공 (API 실패 시 사용)
const getDefaultSuggestions = (addressData) => {
  const suggestions = {
    dong: [],
    ho: [],
    area: [],
    isRealData: false,
  }

  // 공동주택인 경우 일반적인 동/호수 범위 제안
  if (addressData.apartment === 'Y') {
    const buildingName = addressData.buildingName || ''

    // 아파트 단지 규모에 따른 동 수 추정
    if (
      buildingName.includes('단지') ||
      buildingName.includes('타운') ||
      buildingName.includes('마을')
    ) {
      // 대규모 단지
      suggestions.dong = Array.from({ length: 15 }, (_, i) => (i + 1).toString())
    } else {
      // 일반 규모
      suggestions.dong = Array.from({ length: 8 }, (_, i) => (i + 1).toString())
    }

    // 일반적인 호수 범위 (20층 × 4호/층 가정)
    const floors = 20
    const unitsPerFloor = 4
    suggestions.ho = []

    for (let floor = 1; floor <= floors; floor++) {
      for (let unit = 1; unit <= unitsPerFloor; unit++) {
        suggestions.ho.push(`${floor}0${unit}`)
      }
    }

    // 부동산 유형별 실제 시장에서 흔한 전용면적
    if (buildingName.includes('아파트') || buildingName.includes('APT')) {
      suggestions.area = ['59.92', '74.93', '84.78', '101.85', '114.93', '134.85', '164.82']
    } else if (buildingName.includes('오피스텔') || buildingName.includes('OFFICETEL')) {
      suggestions.area = ['16.52', '23.14', '29.75', '33.06', '42.97', '59.92']
    } else if (buildingName.includes('빌라') || buildingName.includes('연립')) {
      suggestions.area = ['59.92', '74.93', '84.78', '101.85']
    } else {
      // 일반 공동주택
      suggestions.area = ['59.92', '74.93', '84.78', '101.85']
    }
  }

  return suggestions
}

// 주소 기반 동/호수 정보 제공 (실제 API 연동)
const getSuggestedDongHo = async (addressData) => {
  // 실제 부동산 정보 API 호출 시도
  const realInfo = await fetchRealEstateInfo(addressData)
  return realInfo
}

// 건물 일련번호 조회 함수
const fetchComplexNo = async (addrSido, addrSigun, addrDong, buildingName) => {
  try {
    console.log('건물 일련번호 조회 시작:', { addrSido, addrSigun, addrDong, buildingName })

    const result = await codefStore.getComplexNo(addrSido, addrSigun, addrDong, buildingName)

    if (result.success) {
      console.log('건물 일련번호 조회 성공:', result.data.complexNo)
      // 건물 일련번호를 폼 데이터에 저장
      updateFormData('complexNo', result.data.complexNo)
      return result.data.complexNo
    } else {
      console.log('건물 일련번호 조회 실패:', result.error)
      return null
    }
  } catch (error) {
    console.error('건물 일련번호 조회 오류:', error)
    return null
  }
}

// 주소 선택 핸들러
const handleAddressSelected = (addressData) => {
  console.log('🏠 주소 검색 완료:', addressData)

  // 주소 정보를 폼 데이터에 저장
  formData.value.roadAddress = addressData.roadAddress
  formData.value.buildingName = addressData.buildingName || ''
  formData.value.zonecode = addressData.zonecode
  formData.value.sido = addressData.sido
  formData.value.sigungu = addressData.sigungu
  formData.value.siCode = addressData.siCode
  formData.value.eupmyeondong = addressData.eupmyeondong
  formData.value.bname = addressData.bname

  // 부동산 유형 자동 설정
  setBuildingType(addressData)

  // 동/호수/면적 제안 정보 설정 (실제 API 호출)
  getSuggestedDongHo(addressData).then((result) => {
    suggestions.value = result
    showSuggestions.value = addressData.apartment === 'Y' // 공동주택인 경우만 제안 표시

    // 실제 데이터 여부에 따른 UI 표시
    if (result.isRealData) {
      console.log('✅ 실제 부동산 데이터 적용됨')
    } else {
      console.log('📋 추정 데이터 사용 중')
    }
  })

  // 가공된 주소 필드에 저장
  updateDetailAddress()

  // 건물 일련번호 조회 및 저장
  if (
    addressData.sido &&
    addressData.sigungu &&
    addressData.eupmyeondong &&
    addressData.buildingName
  ) {
    fetchComplexNo(
      addressData.sido,
      addressData.sigungu,
      addressData.eupmyeondong,
      addressData.buildingName
    )
  }

  // 부모 컴포넌트에 업데이트 알림
  emit('update:modelValue', { ...formData.value })
}

// 기존 우편번호 검색 팝업 열기 (백업용)
const openPostcode = () => {
  if (!daumPostcode) {
    alert('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
    return
  }

  new daumPostcode({
    oncomplete: async function (data) {
      // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분입니다.
      // 각 주소의 노출 규칙에 따라 주소를 조합합니다.
      // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
      let addr = '' // 주소 변수
      let extraAddr = '' // 참고항목 변수

      //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
      if (data.userSelectedType === 'R') {
        // 사용자가 도로명 주소를 선택했을 경우
        addr = data.roadAddress
      } else {
        // 사용자가 지번 주소를 선택했을 경우(J)
        addr = data.jibunAddress
      }

      // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
      if (data.userSelectedType === 'R') {
        // 법정동명이 있을 경우 추가한다. (법정리는 제외)
        // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname
        }
        // 건물명이 있고, 공동주택일 경우 추가한다.
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraAddr += extraAddr !== '' ? ', ' + data.buildingName : data.buildingName
        }
        // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
        if (extraAddr !== '') {
          extraAddr = ' (' + extraAddr + ')'
        }
        // 조합된 참고항목을 해당 필드에 넣는다.
        // addr += extraAddr
      }

      // 주소 정보를 해당 필드에 넣는다.
      updateFormData('roadAddress', addr)
      updateFormData('zonecode', data.zonecode)
      updateFormData('sido', data.sido)
      updateFormData('sigungu', data.sigungu)
      updateFormData('siCode', data.siCode)
      updateFormData('eupmyeondong', data.eupmyeondong)
      updateFormData('bname', data.bname)

      // 건물명 정보 추가
      updateFormData('buildingName', data.buildingName || '')

      // 부동산 유형 자동 설정
      setBuildingType(data)

      // 동/호수/면적 제안 정보 설정 (실제 API 호출)
      getSuggestedDongHo(data).then((result) => {
        suggestions.value = result
        showSuggestions.value = data.apartment === 'Y' // 공동주택인 경우만 제안 표시

        // 실제 데이터 여부에 따른 UI 표시
        if (result.isRealData) {
          console.log('✅ 실제 부동산 데이터 적용됨')
        } else {
          console.log('📋 추정 데이터 사용 중')
        }
      })

      // 가공된 주소 필드에 저장
      updateFormData('addrSido', data.sido)
      updateFormData('addrSigun', data.sigungu)
      // bname(법정동명)을 사용하여 동 정보 가져오기
      updateFormData('addrDong', data.bname || data.eupmyeondong)

      console.log('가공된 주소 데이터:', {
        addrSido: data.sido,
        addrSigun: data.sigungu,
        addrDong: data.bname || data.eupmyeondong,
        buildingName: data.buildingName,
      })

      // 주소 데이터를 받은 후 자동으로 건물 일련번호 조회
      if (data.sido && data.sigungu && (data.bname || data.eupmyeondong)) {
        const complexNo = await fetchComplexNo(
          data.sido,
          data.sigungu,
          data.bname || data.eupmyeondong,
          data.buildingName || ''
        )

        if (complexNo) {
          console.log('건물 일련번호 자동 조회 완료:', complexNo)
        }
      }
    },
    theme: {
      searchBgColor: '#0B65C8', //검색창 배경색
      queryTextColor: '#FFFFFF', //검색창 글자색
    },
  }).open()
}

// 동과 호수를 조합하여 detailAddress 업데이트
const updateDetailAddress = () => {
  const dong = formData.value.buildingDong || ''
  const ho = formData.value.buildingHo || ''

  if (dong && ho) {
    updateFormData('detailAddress', `${dong}동 ${ho}호`)
  } else if (dong) {
    updateFormData('detailAddress', `${dong}동`)
  } else if (ho) {
    updateFormData('detailAddress', `${ho}호`)
  } else {
    updateFormData('detailAddress', '')
  }
}

// 동 정보 업데이트 (숫자만 허용)
const updateBuildingDong = (value) => {
  // 숫자만 허용
  const numericValue = value.replace(/[^0-9]/g, '')
  formData.value.buildingDong = numericValue
  updateDetailAddress()
  emit('update:modelValue', { ...formData.value })
}

// 호수 정보 업데이트 (숫자만 허용)
const updateBuildingHo = (value) => {
  // 숫자만 허용
  const numericValue = value.replace(/[^0-9]/g, '')
  formData.value.buildingHo = numericValue
  updateDetailAddress()
  emit('update:modelValue', { ...formData.value })
}
</script>

<template>
  <div class="space-y-8">
    <!-- 등록자 유형 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-4">등록자 유형</label>
      <RadioGroup
        v-model="formData.registrantType"
        :options="registrantTypeOptions"
        name="registrantType"
        :columns="2"
        @update:model-value="updateFormData('registrantType', $event)"
      />
    </div>

    <!-- 매물 종류 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-4">매물 종류</label>
      <PropertyTypeSelector
        v-model="formData.propertyType"
        @update:model-value="updateFormData('propertyType', $event)"
      />
    </div>

    <!-- 도로명 주소 -->
    <AddressSearch v-model="formData.roadAddress" @address-selected="handleAddressSelected" />

    <!-- 부동산 유형 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-4">부동산 유형</label>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <label
          class="relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="
            formData.buildingType === 'apartment'
              ? 'border-brand-3 bg-brand-3 bg-opacity-10'
              : 'border-gray-200 hover:border-brand-3 hover:bg-gray-50'
          "
        >
          <input
            type="radio"
            name="buildingType"
            :value="'apartment'"
            :checked="formData.buildingType === 'apartment'"
            @change="updateFormData('buildingType', 'apartment')"
            class="sr-only"
          />
          <div
            class="flex items-center justify-center w-5 h-5 mr-2 border-2 rounded-full"
            :class="
              formData.buildingType === 'apartment'
                ? 'border-brand-3 bg-brand-3'
                : 'border-gray-300'
            "
          >
            <div
              v-if="formData.buildingType === 'apartment'"
              class="w-1.5 h-1.5 bg-white rounded-full"
            ></div>
          </div>
          <span class="text-sm font-medium text-text-2">아파트</span>
        </label>
        <label
          class="relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="
            formData.buildingType === 'officetel'
              ? 'border-brand-3 bg-brand-3 bg-opacity-10'
              : 'border-gray-200 hover:border-brand-3 hover:bg-gray-50'
          "
        >
          <input
            type="radio"
            name="buildingType"
            :value="'officetel'"
            :checked="formData.buildingType === 'officetel'"
            @change="updateFormData('buildingType', 'officetel')"
            class="sr-only"
          />
          <div
            class="flex items-center justify-center w-5 h-5 mr-2 border-2 rounded-full"
            :class="
              formData.buildingType === 'officetel'
                ? 'border-brand-3 bg-brand-3'
                : 'border-gray-300'
            "
          >
            <div
              v-if="formData.buildingType === 'officetel'"
              class="w-1.5 h-1.5 bg-white rounded-full"
            ></div>
          </div>
          <span class="text-sm font-medium text-text-2">오피스텔</span>
        </label>
        <label
          class="relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="
            formData.buildingType === 'villa'
              ? 'border-brand-3 bg-brand-3 bg-opacity-10'
              : 'border-gray-200 hover:border-brand-3 hover:bg-gray-50'
          "
        >
          <input
            type="radio"
            name="buildingType"
            :value="'villa'"
            :checked="formData.buildingType === 'villa'"
            @change="updateFormData('buildingType', 'villa')"
            class="sr-only"
          />
          <div
            class="flex items-center justify-center w-5 h-5 mr-2 border-2 rounded-full"
            :class="
              formData.buildingType === 'villa' ? 'border-brand-3 bg-brand-3' : 'border-gray-300'
            "
          >
            <div
              v-if="formData.buildingType === 'villa'"
              class="w-1.5 h-1.5 bg-white rounded-full"
            ></div>
          </div>
          <span class="text-sm font-medium text-text-2">연립</span>
        </label>
        <label
          class="relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="
            formData.buildingType === 'house'
              ? 'border-brand-3 bg-brand-3 bg-opacity-10'
              : 'border-gray-200 hover:border-brand-3 hover:bg-gray-50'
          "
        >
          <input
            type="radio"
            name="buildingType"
            :value="'house'"
            :checked="formData.buildingType === 'house'"
            @change="updateFormData('buildingType', 'house')"
            class="sr-only"
          />
          <div
            class="flex items-center justify-center w-5 h-5 mr-2 border-2 rounded-full"
            :class="
              formData.buildingType === 'house' ? 'border-brand-3 bg-brand-3' : 'border-gray-300'
            "
          >
            <div
              v-if="formData.buildingType === 'house'"
              class="w-1.5 h-1.5 bg-white rounded-full"
            ></div>
          </div>
          <span class="text-sm font-medium text-text-2">주택</span>
        </label>
      </div>
    </div>

    <!-- 건물명 -->
    <div v-if="formData.buildingName">
      <label class="block text-sm font-medium text-text-2 mb-2">건물명</label>
      <Input
        :model-value="formData.buildingName"
        @update:model-value="updateFormData('buildingName', $event)"
        placeholder="건물명"
        class="w-full"
        readonly
      />
    </div>

    <!-- 상세 주소 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-3">상세 주소</label>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-text-2 mb-2">동</label>
          <input
            :value="formData.buildingDong"
            @input="handleDongInput"
            @keypress="handleNumberKeypress"
            type="text"
            placeholder="예) 101"
            class="w-full px-4 py-3 text-base leading-6 text-text-2 bg-bg-2 border border-bg-1 rounded-lg outline-none box-border placeholder:text-text-1 placeholder:text-base focus:border-brand-3 focus:ring-1 focus:ring-brand-3 transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-2 mb-2">호수</label>
          <input
            :value="formData.buildingHo"
            @input="handleHoInput"
            @keypress="handleNumberKeypress"
            type="text"
            placeholder="예) 1001"
            class="w-full px-4 py-3 text-base leading-6 text-text-2 bg-bg-2 border border-bg-1 rounded-lg outline-none box-border placeholder:text-text-1 placeholder:text-base focus:border-brand-3 focus:ring-1 focus:ring-brand-3 transition-colors"
          />
        </div>
      </div>
      <p v-if="formData.detailAddress" class="text-sm text-text-1 mt-1">
        <i class="fa-solid fa-info-circle mr-1"></i>
        조합된 주소: {{ formData.detailAddress }}
      </p>
    </div>

    <!-- 전용 면적 -->
    <AreaInput
      v-model="formData.area"
      :suggestions="suggestions"
      :show-suggestions="showSuggestions"
      @update:model-value="updateFormData('area', $event)"
    />

    <!-- 매매가 -->
    <PriceInput
      v-if="formData.propertyType === 'sale'"
      v-model="formData.price"
      label="매매가"
      placeholder="예) 500,000,000"
      :max-value="4000000000"
      max-value-message="가격은 40억 원을 초과할 수 없습니다"
      @update:model-value="updateFormData('price', $event)"
    />

    <!-- 보증금 (전세/월세) -->
    <div v-if="formData.propertyType === 'jeonse' || formData.propertyType === 'monthly'">
      <label class="block text-sm font-medium text-text-2 mb-3">보증금</label>
      <div class="flex items-center space-x-2">
        <input
          :value="formData.deposit"
          @input="handleDepositInput"
          @keypress="handlePriceKeypress"
          type="text"
          placeholder="예) 100,000,000"
          class="w-full px-4 py-3 text-base leading-6 text-text-2 bg-bg-2 border border-bg-1 rounded-lg outline-none box-border placeholder:text-text-1 placeholder:text-base focus:border-brand-3 focus:ring-1 focus:ring-brand-3 transition-colors"
        />
        <span class="text-base font-medium text-text-2">원</span>
      </div>
    </div>

    <!-- 월세 (월세만) -->
    <div v-if="formData.propertyType === 'monthly'">
      <label class="block text-sm font-medium text-text-2 mb-3">월세</label>
      <div class="flex items-center space-x-2">
        <input
          :value="formData.price"
          @input="handlePriceInput"
          @keypress="handlePriceKeypress"
          type="text"
          placeholder="예) 500,000"
          class="w-full px-4 py-3 text-base leading-6 text-text-2 bg-bg-2 border border-bg-1 rounded-lg outline-none box-border placeholder:text-text-1 placeholder:text-base focus:border-brand-3 focus:ring-1 focus:ring-brand-3 transition-colors"
        />
        <span class="text-base font-medium text-text-2">원</span>
      </div>
    </div>

    <!-- 전세금 (전세만) -->
    <div v-if="formData.propertyType === 'jeonse'">
      <label class="block text-sm font-medium text-text-2 mb-3">전세금</label>
      <div class="flex items-center space-x-2">
        <input
          :value="formData.price"
          @input="handlePriceInput"
          @keypress="handlePriceKeypress"
          type="text"
          placeholder="예) 300,000,000"
          class="w-full px-4 py-3 text-base leading-6 text-text-2 bg-bg-2 border border-bg-1 rounded-lg outline-none box-border placeholder:text-text-1 placeholder:text-base focus:border-brand-3 focus:ring-1 focus:ring-brand-3 transition-colors"
        />
        <span class="text-base font-medium text-text-2">원</span>
      </div>
      <p v-if="priceError" class="text-status-2 text-sm mt-1">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>
        {{ priceError }}
      </p>
    </div>

    <!-- 입주 가능 날짜 -->
    <div>
      <label class="block text-sm font-medium text-text-2 mb-4">입주 가능 날짜</label>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label
          class="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="
            formData.moveInType === 'immediate'
              ? 'border-brand-3 bg-brand-3 bg-opacity-10'
              : 'border-gray-200 hover:border-brand-3 hover:bg-gray-50'
          "
        >
          <input
            type="radio"
            name="moveInType"
            :value="'immediate'"
            :checked="formData.moveInType === 'immediate'"
            @change="updateFormData('moveInType', 'immediate')"
            class="sr-only"
          />
          <div
            class="flex items-center justify-center w-6 h-6 mr-3 border-2 rounded-full"
            :class="
              formData.moveInType === 'immediate' ? 'border-brand-3 bg-brand-3' : 'border-gray-300'
            "
          >
            <div
              v-if="formData.moveInType === 'immediate'"
              class="w-2 h-2 bg-white rounded-full"
            ></div>
          </div>
          <span class="font-medium text-text-2">즉시 입주</span>
        </label>
        <label
          class="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="
            formData.moveInType === 'date'
              ? 'border-brand-3 bg-brand-3 bg-opacity-10'
              : 'border-gray-200 hover:border-brand-3 hover:bg-gray-50'
          "
        >
          <input
            type="radio"
            name="moveInType"
            :value="'date'"
            :checked="formData.moveInType === 'date'"
            @change="updateFormData('moveInType', 'date')"
            class="sr-only"
          />
          <div
            class="flex items-center justify-center w-6 h-6 mr-3 border-2 rounded-full"
            :class="
              formData.moveInType === 'date' ? 'border-brand-3 bg-brand-3' : 'border-gray-300'
            "
          >
            <div v-if="formData.moveInType === 'date'" class="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span class="font-medium text-text-2">입주 날짜 선택</span>
        </label>
        <label
          class="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="
            formData.moveInType === 'negotiable'
              ? 'border-brand-3 bg-brand-3 bg-opacity-10'
              : 'border-gray-200 hover:border-brand-3 hover:bg-gray-50'
          "
        >
          <input
            type="radio"
            name="moveInType"
            :value="'negotiable'"
            :checked="formData.moveInType === 'negotiable'"
            @change="updateFormData('moveInType', 'negotiable')"
            class="sr-only"
          />
          <div
            class="flex items-center justify-center w-6 h-6 mr-3 border-2 rounded-full"
            :class="
              formData.moveInType === 'negotiable' ? 'border-brand-3 bg-brand-3' : 'border-gray-300'
            "
          >
            <div
              v-if="formData.moveInType === 'negotiable'"
              class="w-2 h-2 bg-white rounded-full"
            ></div>
          </div>
          <span class="font-medium text-text-2">협의 가능</span>
        </label>
      </div>
      <div v-if="formData.moveInType === 'date'" class="mt-3">
        <Input
          :model-value="formData.moveInDate"
          @update:model-value="updateFormData('moveInDate', $event)"
          type="date"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>
