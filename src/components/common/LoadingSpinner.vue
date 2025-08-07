<template>
  <div class="loading-container" :class="{ 'full-height': fullHeight }">
    <div
      class="loading-spinner"
      :class="{ large: size === 'large', small: size === 'small' }"
    ></div>
    <p class="loading-text" v-if="text">{{ text }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '로딩 중...',
  },
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  fullHeight: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.25rem;
  width: 100%;
  min-height: 50vh;
  margin: 2rem 0;
}

.loading-container.full-height {
  min-height: 100vh;
  margin: 0;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 0.25rem solid var(--bg-2);
  border-top: 0.25rem solid var(--brand-3);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

.loading-spinner.small {
  width: 2rem;
  height: 2rem;
  border-width: 0.2rem;
  margin-bottom: 1rem;
}

.loading-spinner.large {
  width: 4rem;
  height: 4rem;
  border-width: 0.3rem;
  margin-bottom: 2rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--text-2);
  font-size: 1.125rem;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  text-align: center;
}

/* Mobile styles */
@media (max-width: 48rem) {
  .loading-container {
    min-height: 40vh;
    padding: 3rem 1rem;
    margin: 1rem 0;
  }

  .loading-container.full-height {
    min-height: 100vh;
  }

  .loading-spinner {
    width: 2.5rem;
    height: 2.5rem;
  }

  .loading-spinner.small {
    width: 1.5rem;
    height: 1.5rem;
  }

  .loading-spinner.large {
    width: 3rem;
    height: 3rem;
  }

  .loading-text {
    font-size: 1rem;
  }
}

/* Small Mobile styles */
@media (max-width: 30rem) {
  .loading-container {
    padding: 2rem 0.75rem;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
  }

  .loading-spinner.small {
    width: 1.25rem;
    height: 1.25rem;
  }

  .loading-spinner.large {
    width: 2.5rem;
    height: 2.5rem;
  }

  .loading-text {
    font-size: 0.875rem;
  }
}
</style>
