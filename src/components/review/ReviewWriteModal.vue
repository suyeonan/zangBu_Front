<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">매물 리뷰 작성</h2>
      </div>

      <!-- 모달 바디 -->
      <div class="modal-body">
        <!-- 층수 정보 -->
        <div class="form-section">
          <h3 class="section-title">층수 정보를 알려 주세요!</h3>
          <div class="floor-buttons">
            <button
              v-for="floor in floorOptions"
              :key="floor"
              class="floor-btn"
              :class="{ active: selectedFloor === floor }"
              @click="selectedFloor = floor"
            >
              {{ floor }}
            </button>
          </div>
        </div>

        <!-- 별점 -->
        <div class="form-section">
          <h3 class="section-title">별점을 남겨주세요</h3>
          <div class="star-rating">
            <button
              v-for="star in 5"
              :key="star"
              class="star-btn"
              :class="{ filled: star <= selectedRating }"
              @click="selectedRating = star"
              @mouseenter="hoverRating = star"
              @mouseleave="hoverRating = 0"
            >
              ★
            </button>
          </div>
          <p class="rating-text">{{ selectedRating }}점</p>
        </div>

        <!-- 상세 리뷰 -->
        <div class="form-section">
          <h3 class="section-title">상세한 리뷰를 작성해주세요</h3>
          <textarea
            v-model="reviewContent"
            class="review-textarea"
            placeholder="매물에 대한 상세한 리뷰를 작성해주세요..."
            rows="6"
            maxlength="1000"
          ></textarea>
          <div class="char-count">{{ reviewContent.length }}/1000</div>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">취소</button>
        <button class="btn-submit" @click="submitReview" :disabled="!isFormValid">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createReview } from '@/api/review/review.js'

// Props
const props = defineProps({
  buildingId: {
    type: Number,
    required: true,
  },
  addressId: {
    type: Number,
    default: 7, // 기본값
  },
  buildingName: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['close', 'review-created'])

// 반응형 데이터
const selectedFloor = ref('중층')
const selectedRating = ref(0)
const hoverRating = ref(0)
const reviewContent = ref('')
const isSubmitting = ref(false)

// 층수 옵션
const floorOptions = ['저층', '중층', '고층']

// 폼 유효성 검사
const isFormValid = computed(() => {
  return selectedFloor.value && selectedRating.value > 0 && reviewContent.value.trim().length > 0
})

// 모달 닫기
const closeModal = () => {
  emit('close')
}

// 리뷰 제출
const submitReview = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true

    const reviewData = {
      buildingId: props.buildingId,
      addressId: props.addressId,
      floor: selectedFloor.value,
      rank: selectedRating.value,
      content: reviewContent.value.trim(),
    }

    const response = await createReview(reviewData)

    // 성공 메시지
    alert('리뷰가 성공적으로 등록되었습니다!')

    // 부모 컴포넌트에 알림
    emit('review-created', response)

    // 모달 닫기
    closeModal()
  } catch (error) {
    console.error('리뷰 작성 실패:', error)
    alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #4caf50;
  text-align: center;
}

.modal-body {
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 층수 버튼 */
.floor-buttons {
  display: flex;
  gap: 12px;
}

.floor-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.floor-btn:hover {
  border-color: #4caf50;
  color: #4caf50;
}

.floor-btn.active {
  border-color: #4caf50;
  background: #4caf50;
  color: white;
}

/* 별점 */
.star-rating {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
  line-height: 1;
}

.star-btn:hover,
.star-btn.filled {
  color: #ffc107;
}

.rating-text {
  margin: 0;
  font-size: 14px;
  color: #666;
  text-align: center;
}

/* 리뷰 텍스트 영역 */
.review-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  box-sizing: border-box;
}

.review-textarea:focus {
  outline: none;
  border-color: #4caf50;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 모달 푸터 */
.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: #4caf50;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #45a049;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 반응형 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .floor-buttons {
    flex-direction: column;
  }

  .star-rating {
    justify-content: center;
  }
}
</style>
