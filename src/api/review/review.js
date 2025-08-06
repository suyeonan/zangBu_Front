import api from '../axios'

// Mock 데이터
const mockBuildingData = {
  '1': { buildingName: '래미안 강남 포레스트', address: '서울특별시 강남구 테헤란로 123' },
  '2': { buildingName: '홍익타워', address: '서울특별시 마포구 양화로 45' },
  '3': { buildingName: '종로타워', address: '서울특별시 종로구 종로 1' },
  '4': { buildingName: '파크원타워', address: '서울특별시 영등포구 여의대로 108' },
  '5': { buildingName: '구의건내2 아파트', address: '서울특별시 광진구 구의동' },
  '6': { buildingName: '역삼동 아파트', address: '서울특별시 강남구 역삼동' },
  '7': { buildingName: '서초동 빌라', address: '서울특별시 서초구 서초동' },
  '8': { buildingName: '합정동 오피스텔', address: '서울특별시 마포구 합정동' },
  '9': { buildingName: '청담동 주택', address: '서울특별시 강남구 청담동' },
  '10': { buildingName: '잠실 아파트', address: '서울특별시 송파구 잠실동' },
  '11': { buildingName: '성수동 오피스텔', address: '서울특별시 성동구 성수동' },
  '12': { buildingName: '이태원 빌라', address: '서울특별시 용산구 이태원동' }
}

const mockReviewsData = {
  '1': [
    { reviewId: 1, reviewerNickName: '부동산왕', title: '깔끔하고 교통이 편리한 원룸', rank: 4, floor: '중층' },
    { reviewId: 2, reviewerNickName: '집찾는사람', title: '뷰가 좋은 고층 투룸', rank: 5, floor: '고층' },
    { reviewId: 3, reviewerNickName: '집주인', title: '조용하고 안전한 동네', rank: 4, floor: '저층' },
    { reviewId: 4, reviewerNickName: '부동산맨', title: '가격 대비 만족도 높음', rank: 3, floor: '중층' },
    { reviewId: 5, reviewerNickName: '집사랑', title: '편의시설이 가까워서 좋아요', rank: 5, floor: '고층' }
  ],
  '2': [
    { reviewId: 6, reviewerNickName: '마포사랑', title: '한강뷰가 정말 예뻐요', rank: 5, floor: '고층' },
    { reviewId: 7, reviewerNickName: '홍대맨', title: '문화생활하기 좋은 위치', rank: 4, floor: '중층' },
    { reviewId: 8, reviewerNickName: '예술가', title: '창의적인 분위기의 공간', rank: 4, floor: '저층' }
  ],
  '3': [
    { reviewId: 9, reviewerNickName: '종로맨', title: '전통과 현대가 공존하는 곳', rank: 4, floor: '중층' },
    { reviewId: 10, reviewerNickName: '역사탐방가', title: '문화재가 가까워서 좋아요', rank: 5, floor: '고층' }
  ],
  '4': [
    { reviewId: 11, reviewerNickName: '여의도맨', title: '비즈니스하기 좋은 위치', rank: 5, floor: '고층' },
    { reviewId: 12, reviewerNickName: '직장인', title: '교통편이 정말 편리해요', rank: 4, floor: '중층' }
  ],
  '5': [
    { reviewId: 13, reviewerNickName: '구의맨', title: '가족들이 살기 좋은 동네', rank: 4, floor: '중층' },
    { reviewId: 14, reviewerNickName: '아빠', title: '학교가 가까워서 좋아요', rank: 5, floor: '저층' }
  ],
  '6': [
    { reviewId: 15, reviewerNickName: '역삼맨', title: '강남의 중심지', rank: 5, floor: '고층' },
    { reviewId: 16, reviewerNickName: 'IT맨', title: 'IT회사들이 많아서 좋아요', rank: 4, floor: '중층' },
    { reviewId: 17, reviewerNickName: '강남사랑', title: '강남역이 가까워서 편리', rank: 4, floor: '저층' }
  ],
  '7': [
    { reviewId: 18, reviewerNickName: '서초맨', title: '조용하고 깔끔한 동네', rank: 4, floor: '중층' },
    { reviewId: 19, reviewerNickName: '가족맨', title: '가족들이 살기 좋아요', rank: 5, floor: '저층' }
  ],
  '8': [
    { reviewId: 20, reviewerNickName: '합정맨', title: '힙한 분위기의 동네', rank: 5, floor: '고층' },
    { reviewId: 21, reviewerNickName: '예술가2', title: '창작활동하기 좋은 곳', rank: 4, floor: '중층' }
  ],
  '9': [
    { reviewId: 22, reviewerNickName: '청담맨', title: '고급스러운 동네', rank: 5, floor: '고층' },
    { reviewId: 23, reviewerNickName: '패션맨', title: '패션의 중심지', rank: 4, floor: '중층' }
  ],
  '10': [
    { reviewId: 24, reviewerNickName: '잠실맨', title: '올림픽공원이 가까워요', rank: 5, floor: '고층' },
    { reviewId: 25, reviewerNickName: '스포츠맨', title: '운동하기 좋은 환경', rank: 4, floor: '중층' }
  ],
  '11': [
    { reviewId: 26, reviewerNickName: '성수맨', title: '창업하기 좋은 동네', rank: 4, floor: '중층' },
    { reviewId: 27, reviewerNickName: '스타트업맨', title: '젊은 분위기가 좋아요', rank: 5, floor: '고층' }
  ],
  '12': [
    { reviewId: 28, reviewerNickName: '이태원맨', title: '다문화의 중심지', rank: 4, floor: '중층' },
    { reviewId: 29, reviewerNickName: '외국인', title: '외국인들이 많아서 좋아요', rank: 5, floor: '저층' }
  ]
}

const mockReviewDetails = {
  1: {
    reviewId: 1,
    buildingId: 1,
    addressId: '서울특별시 강남구 테헤란로 123',
    reviewerNickname: '부동산왕',
    rank: 4,
    title: '깔끔하고 교통이 편리한 원룸',
    content: '역에서 가깝고 깔끔한 원룸입니다. 주변 편의시설도 많고 교통편이 정말 좋아요. 방음도 괜찮고 전반적으로 만족합니다.',
    createdAt: '2024-01-15T10:30:00Z'
  },
  2: {
    reviewId: 2,
    buildingId: 1,
    addressId: '서울특별시 강남구 테헤란로 123',
    reviewerNickname: '집찾는사람',
    rank: 5,
    title: '뷰가 좋은 고층 투룸',
    content: '20층 고층이라 뷰가 정말 좋습니다. 한강도 보이고 야경도 예뻐요. 방음도 잘 되어 있어서 조용합니다. 엘리베이터가 가끔 오래 기다려야 하는 점이 아쉽지만 전반적으로 만족합니다.',
    createdAt: '2024-01-10T14:20:00Z'
  },
  3: {
    reviewId: 3,
    buildingId: 1,
    addressId: '서울특별시 강남구 테헤란로 123',
    reviewerNickname: '집주인',
    rank: 4,
    title: '조용하고 안전한 동네',
    content: '치안이 좋고 조용한 동네입니다. 아이들이 뛰어놀기 좋고, 이웃들도 친절해요. 주차장도 넉넉해서 편리합니다.',
    createdAt: '2024-01-08T09:15:00Z'
  },
  4: {
    reviewId: 4,
    buildingId: 1,
    addressId: '서울특별시 강남구 테헤란로 123',
    reviewerNickname: '부동산맨',
    rank: 3,
    title: '가격 대비 만족도 높음',
    content: '가격 대비 괜찮은 매물입니다. 시설은 조금 오래되었지만 관리가 잘 되어 있어서 깔끔해요. 주변 환경도 좋습니다.',
    createdAt: '2024-01-05T16:45:00Z'
  },
  5: {
    reviewId: 5,
    buildingId: 1,
    addressId: '서울특별시 강남구 테헤란로 123',
    reviewerNickname: '집사랑',
    rank: 5,
    title: '편의시설이 가까워서 좋아요',
    content: '마트, 약국, 은행이 모두 가까워서 정말 편리해요. 특히 24시간 편의점이 바로 옆에 있어서 좋습니다. 교통편도 훌륭합니다.',
    createdAt: '2024-01-03T11:30:00Z'
  },
  6: {
    reviewId: 6,
    buildingId: 2,
    addressId: '서울특별시 마포구 양화로 45',
    reviewerNickname: '마포사랑',
    rank: 5,
    title: '한강뷰가 정말 예뻐요',
    content: '한강이 바로 보이는 고층입니다. 일몰 시간대가 정말 아름다워요. 공기도 좋고 조용해서 휴식하기 좋습니다.',
    createdAt: '2024-01-12T18:20:00Z'
  },
  7: {
    reviewId: 7,
    buildingId: 2,
    addressId: '서울특별시 마포구 양화로 45',
    reviewerNickname: '홍대맨',
    rank: 4,
    title: '문화생활하기 좋은 위치',
    content: '홍대가 가까워서 문화생활하기 정말 좋아요. 공연장, 카페, 레스토랑이 많아서 외출할 때마다 새로운 곳을 발견할 수 있어요.',
    createdAt: '2024-01-09T13:10:00Z'
  },
  8: {
    reviewId: 8,
    buildingId: 2,
    addressId: '서울특별시 마포구 양화로 45',
    reviewerNickname: '예술가',
    rank: 4,
    title: '창의적인 분위기의 공간',
    content: '예술가들이 많이 모여있는 동네라서 창의적인 분위기가 좋아요. 갤러리도 많고 문화공간도 다양해서 영감을 받기 좋습니다.',
    createdAt: '2024-01-07T15:45:00Z'
  },
  9: {
    reviewId: 9,
    buildingId: 3,
    addressId: '서울특별시 종로구 종로 1',
    reviewerNickname: '종로맨',
    rank: 4,
    title: '전통과 현대가 공존하는 곳',
    content: '전통시장과 현대적인 상가가 함께 있어서 정말 특별한 분위기예요. 역사적인 장소들도 가까워서 문화생활하기 좋습니다.',
    createdAt: '2024-01-11T12:30:00Z'
  },
  10: {
    reviewId: 10,
    buildingId: 3,
    addressId: '서울특별시 종로구 종로 1',
    reviewerNickname: '역사탐방가',
    rank: 5,
    title: '문화재가 가까워서 좋아요',
    content: '경복궁, 창덕궁 등 문화재가 가까워서 주말에 산책하기 좋아요. 전통문화를 체험할 수 있는 곳들이 많아서 만족합니다.',
    createdAt: '2024-01-06T10:20:00Z'
  },
  11: {
    reviewId: 11,
    buildingId: 4,
    addressId: '서울특별시 영등포구 여의대로 108',
    reviewerNickname: '여의도맨',
    rank: 5,
    title: '비즈니스하기 좋은 위치',
    content: '여의도 금융가가 가까워서 비즈니스하기 정말 좋아요. 대기업들이 많고 교통편도 훌륭해서 출퇴근이 편리합니다.',
    createdAt: '2024-01-14T09:15:00Z'
  },
  12: {
    reviewId: 12,
    buildingId: 4,
    addressId: '서울특별시 영등포구 여의대로 108',
    reviewerNickname: '직장인',
    rank: 4,
    title: '교통편이 정말 편리해요',
    content: '지하철역이 가깝고 버스도 많이 다녀서 교통편이 정말 편리해요. 여의도역에서 바로 연결되어서 출퇴근이 수월합니다.',
    createdAt: '2024-01-13T17:30:00Z'
  },
  13: {
    reviewId: 13,
    buildingId: 5,
    addressId: '서울특별시 광진구 구의동',
    reviewerNickname: '구의맨',
    rank: 4,
    title: '가족들이 살기 좋은 동네',
    content: '가족들이 살기 좋은 동네예요. 학교도 가깝고 공원도 많아서 아이들이 뛰어놀기 좋습니다. 치안도 좋고 조용해서 만족합니다.',
    createdAt: '2024-01-12T14:45:00Z'
  },
  14: {
    reviewId: 14,
    buildingId: 5,
    addressId: '서울특별시 광진구 구의동',
    reviewerNickname: '아빠',
    rank: 5,
    title: '학교가 가까워서 좋아요',
    content: '초등학교와 중학교가 가까워서 아이들 교육하기 좋아요. 도서관도 가깝고 학습환경이 좋습니다.',
    createdAt: '2024-01-10T11:20:00Z'
  },
  15: {
    reviewId: 15,
    buildingId: 6,
    addressId: '서울특별시 강남구 역삼동',
    reviewerNickname: '역삼맨',
    rank: 5,
    title: '강남의 중심지',
    content: '강남의 중심지라서 모든 것이 편리해요. 쇼핑, 식사, 교통 모든 면에서 최고입니다. 강남역이 가까워서 더욱 좋아요.',
    createdAt: '2024-01-15T16:30:00Z'
  },
  16: {
    reviewId: 16,
    buildingId: 6,
    addressId: '서울특별시 강남구 역삼동',
    reviewerNickname: 'IT맨',
    rank: 4,
    title: 'IT회사들이 많아서 좋아요',
    content: 'IT회사들이 많이 모여있어서 네트워킹하기 좋아요. 스타트업도 많고 기술적인 분위기가 좋습니다.',
    createdAt: '2024-01-14T13:45:00Z'
  },
  17: {
    reviewId: 17,
    buildingId: 6,
    addressId: '서울특별시 강남구 역삼동',
    reviewerNickname: '강남사랑',
    rank: 4,
    title: '강남역이 가까워서 편리',
    content: '강남역이 가까워서 교통편이 정말 편리해요. 지하철 2호선과 신분당선을 모두 이용할 수 있어서 좋습니다.',
    createdAt: '2024-01-13T10:15:00Z'
  },
  18: {
    reviewId: 18,
    buildingId: 7,
    addressId: '서울특별시 서초구 서초동',
    reviewerNickname: '서초맨',
    rank: 4,
    title: '조용하고 깔끔한 동네',
    content: '조용하고 깔끔한 동네예요. 주차도 편리하고 치안도 좋아서 안전합니다. 가족들이 살기 좋은 환경입니다.',
    createdAt: '2024-01-12T15:20:00Z'
  },
  19: {
    reviewId: 19,
    buildingId: 7,
    addressId: '서울특별시 서초구 서초동',
    reviewerNickname: '가족맨',
    rank: 5,
    title: '가족들이 살기 좋아요',
    content: '가족들이 살기 정말 좋은 동네예요. 공원도 많고 학교도 가깝고, 조용해서 아이들 교육하기 좋습니다.',
    createdAt: '2024-01-11T12:10:00Z'
  },
  20: {
    reviewId: 20,
    buildingId: 8,
    addressId: '서울특별시 마포구 합정동',
    reviewerNickname: '합정맨',
    rank: 5,
    title: '힙한 분위기의 동네',
    content: '힙한 분위기의 동네예요. 카페도 많고 레스토랑도 다양해서 외식하기 좋아요. 젊은 분위기가 좋습니다.',
    createdAt: '2024-01-14T18:30:00Z'
  },
  21: {
    reviewId: 21,
    buildingId: 8,
    addressId: '서울특별시 마포구 합정동',
    reviewerNickname: '예술가2',
    rank: 4,
    title: '창작활동하기 좋은 곳',
    content: '창작활동하기 정말 좋은 곳이에요. 갤러리도 많고 예술가들이 많이 모여있어서 영감을 받기 좋습니다.',
    createdAt: '2024-01-13T14:25:00Z'
  },
  22: {
    reviewId: 22,
    buildingId: 9,
    addressId: '서울특별시 강남구 청담동',
    reviewerNickname: '청담맨',
    rank: 5,
    title: '고급스러운 동네',
    content: '고급스러운 동네예요. 명품점도 많고 고급 레스토랑도 많아서 분위기가 좋습니다. 치안도 훌륭해요.',
    createdAt: '2024-01-15T19:45:00Z'
  },
  23: {
    reviewId: 23,
    buildingId: 9,
    addressId: '서울특별시 강남구 청담동',
    reviewerNickname: '패션맨',
    rank: 4,
    title: '패션의 중심지',
    content: '패션의 중심지라서 쇼핑하기 좋아요. 명품 브랜드 매장들이 많고 패션 트렌드를 쉽게 접할 수 있습니다.',
    createdAt: '2024-01-14T16:20:00Z'
  },
  24: {
    reviewId: 24,
    buildingId: 10,
    addressId: '서울특별시 송파구 잠실동',
    reviewerNickname: '잠실맨',
    rank: 5,
    title: '올림픽공원이 가까워요',
    content: '올림픽공원이 가까워서 운동하기 정말 좋아요. 넓은 공원에서 산책하고 자전거도 탈 수 있어서 만족합니다.',
    createdAt: '2024-01-13T11:30:00Z'
  },
  25: {
    reviewId: 25,
    buildingId: 10,
    addressId: '서울특별시 송파구 잠실동',
    reviewerNickname: '스포츠맨',
    rank: 4,
    title: '운동하기 좋은 환경',
    content: '운동하기 정말 좋은 환경이에요. 체육관도 많고 공원도 넓어서 다양한 운동을 할 수 있습니다.',
    createdAt: '2024-01-12T09:15:00Z'
  },
  26: {
    reviewId: 26,
    buildingId: 11,
    addressId: '서울특별시 성동구 성수동',
    reviewerNickname: '성수맨',
    rank: 4,
    title: '창업하기 좋은 동네',
    content: '창업하기 정말 좋은 동네예요. 스타트업들이 많이 모여있고 창업 지원 시설도 많아서 좋습니다.',
    createdAt: '2024-01-11T13:40:00Z'
  },
  27: {
    reviewId: 27,
    buildingId: 11,
    addressId: '서울특별시 성동구 성수동',
    reviewerNickname: '스타트업맨',
    rank: 5,
    title: '젊은 분위기가 좋아요',
    content: '젊은 분위기가 정말 좋아요. 스타트업들이 많고 젊은 사람들이 많이 모여있어서 활기찬 분위기입니다.',
    createdAt: '2024-01-10T17:25:00Z'
  },
  28: {
    reviewId: 28,
    buildingId: 12,
    addressId: '서울특별시 용산구 이태원동',
    reviewerNickname: '이태원맨',
    rank: 4,
    title: '다문화의 중심지',
    content: '다문화의 중심지라서 다양한 문화를 경험할 수 있어요. 세계 각국의 음식점도 많고 외국인들도 많이 만날 수 있습니다.',
    createdAt: '2024-01-09T20:10:00Z'
  },
  29: {
    reviewId: 29,
    buildingId: 12,
    addressId: '서울특별시 용산구 이태원동',
    reviewerNickname: '외국인',
    rank: 5,
    title: '외국인들이 많아서 좋아요',
    content: '외국인들이 많이 살고 있어서 편안해요. 다양한 문화를 경험할 수 있고 국제적인 분위기가 좋습니다.',
    createdAt: '2024-01-08T14:50:00Z'
  }
}

// 지연 시뮬레이션
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 건물 정보 조회
export const getBuildingInfo = async (buildingId) => {
  // Mock 데이터 사용
  await delay(300)

  const buildingInfo = mockBuildingData[buildingId]
  if (!buildingInfo) {
    throw new Error('건물 정보를 찾을 수 없습니다.')
  }

  return { data: buildingInfo }
}

// 특정 건물의 리뷰 목록 조회 (페이지네이션 포함)
export const getReviewsByBuilding = async (buildingId, page = 1, size = 5) => {
  // Mock 데이터 사용
  await delay(500)

  const reviews = mockReviewsData[buildingId] || []
  const total = reviews.length
  const startIndex = (page - 1) * size
  const endIndex = startIndex + size
  const paginatedReviews = reviews.slice(startIndex, endIndex)
  const hasNext = endIndex < total
  const latestReviewRank = reviews.length > 0 ? reviews[0].rank : null

  return {
    data: {
      total,
      reviews: paginatedReviews,
      hasNext,
      latestReviewRank
    }
  }
}

// 리뷰 상세 조회
export const getReviewDetail = async (reviewId) => {
  // Mock 데이터 사용
  await delay(300)

  const reviewDetail = mockReviewDetails[reviewId]
  if (!reviewDetail) {
    throw new Error('리뷰를 찾을 수 없습니다.')
  }

  return { data: reviewDetail }
}

/**
 * 리뷰 작성 API
 * @param {Object} reviewData - 리뷰 데이터
 * @param {number} reviewData.buildingId - 건물 ID
 * @param {number} reviewData.addressId - 주소 ID
 * @param {string} reviewData.floor - 층수 정보 ("저층" | "중층" | "고층")
 * @param {number} reviewData.rank - 별점 (1~5)
 * @param {string} reviewData.content - 리뷰 본문
 * @returns {Promise} 생성된 리뷰 정보
 */
export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/review', reviewData)
    return response.data
  } catch (error) {
    console.error('리뷰 작성 실패:', error)
    throw error
  }
}

// 리뷰 수정
export const updateReview = (id, reviewData) => {
  return api.put(`/reviews/${id}`, reviewData)
}

// 리뷰 삭제
export const deleteReview = (id) => {
  return api.delete(`/reviews/${id}`)
}

// 리뷰 통계 조회
export const getReviewStats = (params) => {
  return api.get('/reviews/stats', { params })
}

// 리뷰 이미지 업로드
export const uploadReviewImage = (reviewId, imageFile) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  return api.post(`/reviews/${reviewId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 리뷰 좋아요/싫어요
export const toggleReviewLike = (reviewId, type) => {
  return api.post(`/reviews/${reviewId}/like`, { type })
}

// 내가 작성한 리뷰 목록
export const getMyReviews = (params) => {
  return api.get('/reviews/my', { params })
}
