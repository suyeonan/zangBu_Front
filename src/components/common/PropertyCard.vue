<template>
  <div class="property-card">
    <!-- Header with property type and bookmark count -->
    <div class="card-header">
      <div class="property-type-badge" :class="getBadgeClass(property.sale_type)">
        <span class="property-type-text">{{ property.sale_type || '전세' }}</span>
      </div>
      <div class="bookmark-count-display" v-if="property.bookmark_count">
        <i class="fas fa-heart bookmark-icon"></i>
        <span class="bookmark-count-text">{{ property.bookmark_count }}</span>
      </div>
    </div>

    <!-- Property image -->
    <div class="image-container">
      <img
        :src="authenticatedImageUrl || '/default-property.jpg'"
        :alt="property.building_name || 'Property Image'"
        class="property-image"
        @error="handleImageError"
      />
    </div>

    <!-- Property details -->
    <div class="details-container">
      <h3 class="property-title">{{ property.building_name || '스카이빌' }}</h3>

      <div class="price-info">
        <span class="price-text">{{ formatPrice(property.price) || '₩300,000,000' }}</span>
        <span class="deposit-text" v-if="property.deposit"
          >보증금: {{ formatPrice(property.deposit) }}</span
        >
      </div>

      <div class="property-info">
        <span class="property-type-badge">{{ formatPropertyType(property.property_type) }}</span>
        <span class="seller-info">{{ property.seller_nickname || '판매자' }}</span>
      </div>

      <div class="description-text">
        {{ property.info_oneline || '매물에 대한 한 줄 소개입니다.' }}
      </div>

      <div class="facility-info" v-if="property.facility">
        <i class="fas fa-map-marker-alt facility-icon"></i>
        <span class="facility-text">{{ property.facility }}</span>
      </div>

      <div class="saved-date">
        {{ property.created_at || '1주 전 저장' }}
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <button @click="handleDetail" class="primary-button">상세 보기</button>
        <button v-if="showEditButton" @click="handleEdit" class="edit-button">수정</button>
        <button @click="handleDelete" class="secondary-button">삭제</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, watch } from 'vue'
import { createSignedUrl } from '@/utils/ncp-object-storage-service'

const props = defineProps({
  property: {
    type: Object,
    required: true,
    default: () => ({
      bookmark_id: '',
      building_id: '',
      complex_id: '',
      seller_nickname: '',
      sale_type: '',
      price: '',
      deposit: '',
      bookmark_count: '',
      created_at: '',
      building_name: '',
      seller_type: '',
      property_type: '',
      info_oneline: '',
      image_url: '',
      facility: '',
    }),
  },
  showEditButton: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['contact', 'detail', 'delete', 'edit'])

// NCP 인증 관련 상태
const authenticatedImageUrl = ref(null)

// NCP URL에서 버킷과 오브젝트 이름 추출
const extractNcpInfo = (url) => {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname === 'kr.object.ncloudstorage.com') {
      const pathParts = urlObj.pathname.split('/').filter((part) => part)
      if (pathParts.length >= 2) {
        return {
          bucketName: pathParts[0],
          objectName: pathParts.slice(1).join('/'),
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse NCP URL:', error)
  }
  return null
}

// 이미지 URL 처리
const processImageUrl = async () => {
  if (!props.property.image_url) {
    authenticatedImageUrl.value = null
    return
  }

  // NCP Object Storage URL인지 확인
  if (props.property.image_url.includes('ncloudstorage.com')) {
    const ncpInfo = extractNcpInfo(props.property.image_url)
    if (ncpInfo) {
      try {
        console.log('Creating signed URL for NCP image:', ncpInfo)
        // 서명된 URL 생성 (CORS 우회)
        const signedUrl = createSignedUrl(ncpInfo.bucketName, ncpInfo.objectName)
        authenticatedImageUrl.value = signedUrl
        console.log('Successfully created signed URL:', signedUrl)
      } catch (error) {
        console.error('Failed to create signed URL:', error)
        authenticatedImageUrl.value = props.property.image_url
      }
    } else {
      authenticatedImageUrl.value = props.property.image_url
    }
  } else {
    authenticatedImageUrl.value = props.property.image_url
  }
}

// 이미지 로드 에러 처리
const handleImageError = () => {
  console.warn('Image failed to load:', authenticatedImageUrl.value || props.property.image_url)
  authenticatedImageUrl.value = null
}

// Handle detail view
const handleDetail = () => {
  emit('detail', props.property)
}

// Handle delete
const handleDelete = () => {
  emit('delete', props.property)
}

// Handle edit
const handleEdit = () => {
  emit('edit', props.property)
}

// Get badge class based on property status
const getBadgeClass = (saleType) => {
  switch (saleType) {
    case '매매':
      return 'status-1'
    case '전세':
      return 'status-2'
    case '월세':
      return 'status-3'
    default:
      return 'status-2' // Default to '전세'
  }
}

// 컴포넌트 마운트 시 이미지 URL 처리
onMounted(() => {
  processImageUrl()
})

// 이미지 URL 변경 시 재처리
watch(
  () => props.property.image_url,
  () => {
    processImageUrl()
  }
)

// Format property type to Korean
const formatPropertyType = (propertyType) => {
  if (!propertyType) return '아파트'

  const type = propertyType.toLowerCase()
  switch (type) {
    case 'apartment':
      return '아파트'
    case 'officetel':
      return '오피스텔'
    case 'villa':
      return '빌라'
    case 'house':
      return '주택'
    default:
      return propertyType // 이미 한글이거나 알 수 없는 타입인 경우 그대로 반환
  }
}

// Format price
const formatPrice = (price) => {
  if (!price) return ''
  const numPrice = parseInt(price)
  if (numPrice >= 100000000) {
    return `₩${(numPrice / 100000000).toFixed(0)}억`
  } else if (numPrice >= 10000) {
    return `₩${(numPrice / 10000).toFixed(0)}만`
  } else {
    return `₩${numPrice.toLocaleString()}`
  }
}
</script>

<style scoped>
.property-card {
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.card-header {
  padding: 16px 20px 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.property-type-badge {
  border-radius: 20px;
  padding: 6px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.property-type-badge.status-1 {
  background: var(--status-2); /* 매매 - 빨간색 */
}

.property-type-badge.status-2 {
  background: var(--status-1); /* 전세 - 파란색 */
}

.property-type-badge.status-3 {
  background: var(--brand-3); /* 월세 - 초록색 */
}

.property-type-text {
  color: var(--text-3);
  font-size: 12px;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  line-height: 1.2;
}

.bookmark-count-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--bg-2);
  border-radius: 12px;
  color: var(--text-2);
}

.bookmark-icon {
  font-size: 12px;
  color: var(--status-2);
}

.bookmark-count-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-1);
  font-family: 'Roboto', sans-serif;
}

/* Image */
.image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Details */
.details-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-title {
  color: var(--brand-1);
  font-size: 18px;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  line-height: 1.4;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.price-info {
  margin-top: 4px;
}

.price-text {
  color: var(--brand-3);
  font-size: 20px;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
}

.property-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.property-type-badge {
  background: var(--brand-1);
  color: var(--text-3);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Roboto', sans-serif;
}

.seller-info {
  color: var(--text-2);
  font-size: 14px;
  font-weight: normal;
  font-family: 'Roboto', sans-serif;
}

.description-text {
  color: var(--text-2);
  font-size: 14px;
  font-weight: normal;
  font-family: 'Roboto', sans-serif;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin-top: 8px;
}

.facility-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.facility-icon {
  color: var(--text-1);
  font-size: 14px;
}

.facility-text {
  color: var(--text-2);
  font-size: 14px;
  font-weight: normal;
  font-family: 'Roboto', sans-serif;
}

.deposit-text {
  color: var(--text-1);
  font-size: 12px;
  font-weight: normal;
  font-family: 'Roboto', sans-serif;
  margin-top: 4px;
}

.saved-date {
  color: var(--text-1);
  font-size: 12px;
  font-weight: normal;
  font-family: 'Roboto', sans-serif;
  margin-top: 4px;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.primary-button {
  flex: 1;
  height: 40px;
  background: var(--brand-3);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: var(--text-3);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.2s ease;
}

.primary-button:hover {
  background: var(--brand-2);
}

.secondary-button {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 2px solid var(--status-2);
  background: var(--bg-2);
  cursor: pointer;
  color: var(--status-2);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
}

.secondary-button:hover {
  background: #fef2f2;
}

.edit-button {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 2px solid var(--brand-3);
  background: var(--bg-2);
  cursor: pointer;
  color: var(--brand-3);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background: var(--brand-3);
  color: var(--text-3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .property-card {
    width: 100%;
    max-width: 320px;
  }
}
</style>
