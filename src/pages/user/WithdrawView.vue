<template>
  <div class="page-container">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-content">
        <button @click="goBack" class="back-button">
          <i class="fas fa-arrow-left icon"></i>
        </button>
        <h1 class="header-title">계정 삭제</h1>
        <div class="icon-placeholder"></div>
      </div>
    </header>

    <!-- 메인 -->
    <main class="main">
      <div class="content-box">
        <!-- 경고 아이콘 -->
        <div class="icon-wrapper">
          <i class="fas fa-exclamation-triangle icon-alert"></i>
        </div>

        <!-- 타이틀 -->
        <div class="text-center">
          <h2 class="title">계정을 삭제하시겠습니까?</h2>
          <p class="subtitle">이 작업은 되돌릴 수 없습니다.</p>
        </div>

        <!-- 정보 박스 -->
        <div class="info-box">
          <div>
            <p class="info-title">
              <i class="fas fa-info-circle icon-info"></i>
              데이터 보관 정책
            </p>
            <p>개인정보는 완전 삭제 전까지 1년간 보관됩니다.</p>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="btn-group">
          <button @click="deleteAccount" class="btn-danger">계정 삭제</button>
          <button @click="goBack" class="btn-cancel">취소</button>
        </div>
      </div>
    </main>

    <!-- ✅ 확인 모달 -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-box">
        <h3 class="modal-title">최종 확인</h3>
        <p class="modal-desc">
          정말로 계정을 삭제하시겠습니까? <br />
          이 작업은 되돌릴 수 없습니다.
        </p>
        <div class="modal-buttons">
          <button class="btn-modal btn-confirm" @click="confirmDelete">삭제</button>
          <button class="btn-modal btn-cancel" @click="showModal = false">돌아가기</button>
        </div>
      </div>
    </div>

    <!-- 계정 삭제 완료 표시 -->
    <div v-if="showToast" class="toast-box">
      <i data-lucide="check-circle" class="w-5 h-5"></i>
      <span class="text-sm">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const showModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const router = useRouter()

function goBack() {
  history.back()
}

function deleteAccount() {
  showModal.value = true
}

function confirmDelete() {
  showModal.value = false
  toastMessage.value = '계정이 삭제되었습니다. 로그인 페이지로 이동합니다.'
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
    router.push('/auth/login')
  }, 2000)
}

onMounted(() => {
  if (window.lucide) window.lucide.createIcons()
})
</script>

<style scoped>
.page-container {
  background-color: var(--bg-1);
  min-height: 100vh;
  font-family: 'Noto Sans KR', sans-serif;
}

.header {
  background-color: var(--bg-2);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1512px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-2);
}

.back-button {
  color: var(--text-1);
  padding: 0.5rem;
  cursor: pointer;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-placeholder {
  width: 1.25rem;
}

.main {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: center;
}

.content-box {
  width: 100%;
  max-width: 1050px;
  background-color: var(--bg-2);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.icon-wrapper {
  width: 4rem;
  height: 4rem;
  margin: 0 auto;
  border-radius: 9999px;
  background-color: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-alert {
  color: #dc2626;
  font-size: 2rem;
}

.text-center {
  margin-top: 1.5rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-2);
}

.subtitle {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-1);
}

.info-box {
  background-color: #fff9e6;
  border: 1px solid #fde68a;
  color: #92400e;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 2rem 0;
  display: flex;
  align-items: start;
  gap: 0.5rem;
  justify-content: center;
}

.icon-info {
  color: #ca8a04;
  font-size: 1rem;
}

.info-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-danger {
  width: 100%;
  background-color: #dc2626;
  color: var(--text-3);
  padding: 0.75rem 0;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.btn-cancel {
  width: 100%;
  background-color: var(--bg-1);
  color: var(--text-2);
  padding: 0.75rem 0;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

/* ✅ 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  background: var(--bg-2);
  padding: 2rem;
  border-radius: 1rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-2);
}

.modal-desc {
  color: var(--text-1);
  font-size: 0.875rem;
  margin: 0.75rem 0 1.5rem;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.btn-modal {
  flex: 1; /* 두 버튼을 동일 너비로 */
  padding: 0.75rem 0;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
}

.btn-confirm {
  flex: 1;
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 0;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
}

.btn-confirm:hover {
  background-color: #b91c1c;
}

/* ✅ 토스트 */
.toast-box {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: #16a34a;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 40;
}
</style>
