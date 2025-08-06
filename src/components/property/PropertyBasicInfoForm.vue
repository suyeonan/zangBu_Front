<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'
import { useCodefStore } from '@/stores/codef/codef.js'

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

// 가격 유효성 검사
const priceError = computed(() => {
  if (!formData.value.price) return ''
  const price = parseInt(formData.value.price)
  if (price > 4000000000) {
    return '매매가는 40억 원을 초과할 수 없습니다'
  }
  return ''
})

// 데이터 변경 시 부모에게 전달
const updateFormData = (field, value) => {
  formData.value[field] = value
  emit('update:modelValue', { ...formData.value })
}

// Daum 우편번호 API 로드
let daumPostcode = null

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

// 우편번호 검색 팝업 열기
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
  <div class="bg-bg-2 rounded-lg border border-bg-1 p-6">
    <h3 class="text-lg font-semibold text-text-2 mb-4">
      <i class="fa-solid fa-clipboard-list mr-2 text-brand-3"></i>
      매물 기본 정보
    </h3>
    <p class="text-text-1 mb-6">매물의 종류와 주소 등 필수 정보를 입력합니다.</p>

    <div class="space-y-6">
      <!-- 등록자 유형 -->
      <div>
        <label class="block text-sm font-medium text-text-2 mb-3">등록자 유형</label>
        <div class="flex space-x-6">
          <label class="flex items-center">
            <input
              type="radio"
              name="registrantType"
              :value="'owner'"
              :checked="formData.registrantType === 'owner'"
              @change="updateFormData('registrantType', 'owner')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">집주인</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="registrantType"
              :value="'tenant'"
              :checked="formData.registrantType === 'tenant'"
              @change="updateFormData('registrantType', 'tenant')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">세입자</span>
          </label>
        </div>
      </div>

      <!-- 매물 종류 -->
      <div>
        <label class="block text-sm font-medium text-text-2 mb-3">매물 종류</label>
        <div class="flex space-x-6">
          <label class="flex items-center">
            <input
              type="radio"
              name="propertyType"
              :value="'sale'"
              :checked="formData.propertyType === 'sale'"
              @change="updateFormData('propertyType', 'sale')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">매매</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="propertyType"
              :value="'jeonse'"
              :checked="formData.propertyType === 'jeonse'"
              @change="updateFormData('propertyType', 'jeonse')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">전세</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="propertyType"
              :value="'monthly'"
              :checked="formData.propertyType === 'monthly'"
              @change="updateFormData('propertyType', 'monthly')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">월세</span>
          </label>
        </div>
      </div>

      <!-- 매매가 -->
      <div>
        <label class="block text-sm font-medium text-text-2 mb-2">매매가</label>
        <div class="flex items-center space-x-2">
          <Input
            :model-value="formData.price"
            @update:model-value="updateFormData('price', $event)"
            type="number"
            placeholder="예) 500000000"
            class="flex-1"
          />
          <span class="text-sm text-text-1">원</span>
        </div>
        <p v-if="priceError" class="text-status-2 text-sm mt-1">
          <i class="fa-solid fa-circle-exclamation mr-1"></i>
          {{ priceError }}
        </p>
      </div>

      <!-- 부동산 유형 -->
      <div>
        <label class="block text-sm font-medium text-text-2 mb-3">부동산 유형</label>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <label class="flex items-center">
            <input
              type="radio"
              name="buildingType"
              :value="'apartment'"
              :checked="formData.buildingType === 'apartment'"
              @change="updateFormData('buildingType', 'apartment')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">아파트</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="buildingType"
              :value="'officetel'"
              :checked="formData.buildingType === 'officetel'"
              @change="updateFormData('buildingType', 'officetel')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">오피스텔</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="buildingType"
              :value="'villa'"
              :checked="formData.buildingType === 'villa'"
              @change="updateFormData('buildingType', 'villa')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">연립</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="buildingType"
              :value="'house'"
              :checked="formData.buildingType === 'house'"
              @change="updateFormData('buildingType', 'house')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">주택</span>
          </label>
        </div>
      </div>

      <!-- 도로명 주소 -->
      <div>
        <label class="block text-sm font-medium text-text-2 mb-2">도로명 주소</label>
        <div class="flex space-x-2">
          <Input
            :model-value="formData.roadAddress"
            @update:model-value="updateFormData('roadAddress', $event)"
            placeholder="예) 서울시 강남구 테헤란로 123"
            class="flex-1"
            readonly
          />
          <Button variant="button4" @click="openPostcode" class="!w-24 !h-10 !text-sm">
            주소 검색
          </Button>
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
        />
      </div>

      <!-- 상세 주소 -->
      <div>
        <label class="block text-sm font-medium text-text-2 mb-2">상세 주소</label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-text-1 mb-1">동</label>
            <Input
              :model-value="formData.buildingDong"
              @update:model-value="updateBuildingDong($event)"
              type="number"
              placeholder="예) 101"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-text-1 mb-1">호수</label>
            <Input
              :model-value="formData.buildingHo"
              @update:model-value="updateBuildingHo($event)"
              type="number"
              placeholder="예) 1001"
              class="w-full"
            />
          </div>
        </div>
        <p v-if="formData.detailAddress" class="text-sm text-text-1 mt-1">
          <i class="fa-solid fa-info-circle mr-1"></i>
          조합된 주소: {{ formData.detailAddress }}
        </p>
      </div>

      <!-- 전용 면적 -->
      <div>
        <label class="block text-sm font-medium text-text-2 mb-2">전용 면적</label>
        <div class="flex items-center space-x-2">
          <Input
            :model-value="formData.area"
            @update:model-value="updateFormData('area', $event)"
            type="number"
            placeholder="예) 94.5"
            class="flex-1"
          />
          <span class="text-sm text-text-1">㎡</span>
        </div>
      </div>

      <!-- 입주 가능 날짜 -->
      <div>
        <label class="block text-sm font-medium text-text-2 mb-3">입주 가능 날짜</label>
        <div class="flex space-x-6">
          <label class="flex items-center">
            <input
              type="radio"
              name="moveInType"
              :value="'immediate'"
              :checked="formData.moveInType === 'immediate'"
              @change="updateFormData('moveInType', 'immediate')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">즉시 입주</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="moveInType"
              :value="'date'"
              :checked="formData.moveInType === 'date'"
              @change="updateFormData('moveInType', 'date')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">입주 날짜 선택</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="moveInType"
              :value="'negotiable'"
              :checked="formData.moveInType === 'negotiable'"
              @change="updateFormData('moveInType', 'negotiable')"
              class="mr-2 w-5 h-5 appearance-none border-2 border-brand-3 rounded-full bg-transparent cursor-pointer checked:bg-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3 focus:ring-opacity-20"
            />
            <span class="text-sm text-text-2">협의 가능</span>
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
  </div>
</template>
