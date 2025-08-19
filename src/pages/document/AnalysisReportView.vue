<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getAnalysisReport } from '@/api/deal/deal'
import BackButton from '@/components/common/BackButton.vue'

const route = useRoute()
const reportHtml = ref('')
const loading = ref(true)
const error = ref(null)

const sectionVisibility = ref({})

const parsedSections = computed(() => {
  if (!reportHtml.value) return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(reportHtml.value, 'text/html')
  const sections = []
  const headers = doc.querySelectorAll('h4')

  headers.forEach((header, index) => {
    let content = ''
    let currentNode = header.nextSibling
    while (currentNode && currentNode.nodeName !== 'H4') {
      if (currentNode.outerHTML) {
        content += currentNode.outerHTML
      } else if (currentNode.nodeType === Node.TEXT_NODE) {
        content += currentNode.textContent
      }
      currentNode = currentNode.nextSibling
    }

    const title = header.textContent.trim()
    sections.push({
      id: `section-${index}`,
      title: title,
      content: content.trim(),
    })

    if (sectionVisibility.value[title] === undefined) {
      sectionVisibility.value[title] = true
    }
  })

  return sections
})

const toggleSection = (title) => {
  sectionVisibility.value[title] = !sectionVisibility.value[title]
}

onMounted(async () => {
  try {
    const reportId = route.params.reportId
    const response = await getAnalysisReport(reportId)
    if (response.data && typeof response.data === 'string') {
      reportHtml.value = response.data
    } else {
      // Fallback to mock data if API response is not as expected
      reportHtml.value = mockHtmlReport
      console.warn('API response is not a string, using mock data.')
    }
  } catch (err) {
    console.error('Failed to fetch analysis report:', err)
    error.value = '분석 리포트를 불러오는 데 실패했습니다. 샘플 데이터를 표시합니다.'
    reportHtml.value = mockHtmlReport // Also use mock on error
  } finally {
    loading.value = false
  }
})

const mockHtmlReport = `
  <h3>부동산 등기부·건축물대장 분석 리포트</h3>
  <h4>1) 주요 재무 지표</h4>
  <ul><li><strong>선순위 채권액:</strong> 384,000,000원</li><li><strong>최종낙찰가(추정):</strong> 316,000,000원</li><li><strong>여유 보증금:</strong> 216,000,000원</li></ul>
  <br />
  <h4>2) 산출 근거</h4>
  <ul><li><strong>선순위 채권액:</strong> 등기부상 순위번호 1번인 근저당권의 채권최고액 384,000,000원을 기준으로 산정했습니다.
          <ul><li><em>참고: 이 담보권은 <strong>건물만에 관한 담보권</strong>이라는 부기등기가 있습니다.</em></li></ul>
      </li><li><strong>최종낙찰가(추정):</strong> 시세(추정) 700,000,000원에서 선순위 채권액(384,000,000원)과 기타 선순위 채무액(0원)을 차감하여 산출했습니다.</li><li><strong>여유 보증금:</strong> 최종낙찰가(추정) 316,000,000원에서 신청 보증금(100,000,000원)을 차감한 금액입니다.</li></ul>
  <br />
  <h4>3) 소유자/권리현황</h4>
  <ul><li><strong>소유자 유형:</strong> 개인 (소유자 이름 ‘김미숙’으로 법인/신탁 관련 표기 없음)</li><li><strong>권리침해 및 기타사항:</strong>
          <ul><li>근저당권 (중소기업은행, 채권최고액 384,000,000원)</li><li>부기등기 (1번 근저당권이 건물에만 해당함을 명시)</li><li>금지사항등기 (현재는 말소됨)</li></ul>
      </li></ul>
  <br />
  <h4>4) 소유권 변동 요약</h4>
  <p>
  2019년 12월 5일 ‘주식회사한길개발’이 소유권보존등기를 하였으며, 이후 2020년 2월 4일 현 소유자인 ‘김미숙’에게 소유권이 이전되었습니다. 이전 사유는 2017년 8월 4일자 매매이며, 거래가액은 504,980,000원입니다.
  </p>
  <br />
  <h4>5) 위반건축물</h4>
  <p>
  없음 (건축물대장상 위반건축물 관련 내용이 기재되어 있지 않습니다.)
  </p>
`
</script>

<template>
  <div class="container mx-auto p-4 bg-gray-50 min-h-screen">
    <header class="flex items-center mb-4">
      <BackButton />
      <h1 class="text-xl font-bold text-center flex-1">분석리포트 상세</h1>
    </header>

    <div v-if="loading" class="text-center">
      <p>로딩 중...</p>
    </div>

    <div
      v-if="error"
      class="text-center text-red-500 p-4 mb-4 border border-red-300 bg-red-50 rounded-lg"
    >
      <p>{{ error }}</p>
    </div>

    <div v-if="!loading" class="space-y-6">
      <div
        v-for="section in parsedSections"
        :key="section.id"
        class="bg-white p-6 border rounded-lg shadow-sm"
      >
        <div
          class="flex justify-between items-center cursor-pointer"
          @click="toggleSection(section.title)"
        >
          <h2 class="text-lg font-semibold">{{ section.title }}</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-1 text-gray-400 transform transition-transform"
            :class="{ 'rotate-180': !sectionVisibility[section.title] }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div
          v-if="sectionVisibility[section.title]"
          class="mt-4 prose max-w-none"
          v-html="section.content"
        ></div>
      </div>
    </div>
  </div>
</template>
