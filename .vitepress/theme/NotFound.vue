<script setup lang="ts">
import { useData } from 'vitepress'
import { onMounted, ref } from 'vue'
const { site } = useData()
let sentence = ref('加载中')

async function fetchHitokotoSentence() {
  const res = await window.fetch('https://v1.hitokoto.cn')
  const data = await res.json()
  sentence.value = `${data.hitokoto} —— ${
    data.from_who ? data.from_who + ' ' : ''
  }『${data.from || ''}』 `
}

onMounted(() => {
  fetchHitokotoSentence().catch((e) => {
    sentence.value = '加载失败'
    console.error(e)
  })
})
</script>

<template>
  <div class="NotFound">
    <p class="code">404</p>
    <h1 class="title">页面不存在</h1>
    <div class="divider" />
    <blockquote class="quote">
      {{ sentence }}
    </blockquote>
    <div class="action">
      <a class="link" :href="site.base" aria-label="返回首页"> 返回首页 </a>
    </div>
  </div>
</template>

<style scoped>
.NotFound {
  padding: 64px 24px 96px;
  text-align: center;
}

@media (width >= 768px) {
  .NotFound {
    padding: 96px 32px 168px;
  }
}

.code {
  font-size: 64px;
  font-weight: 600;
  line-height: 64px;
}

.title {
  padding-top: 12px;
  font-size: 20px;
  font-weight: 700;
  line-height: 20px;
  letter-spacing: 2px;
}

.divider {
  width: 64px;
  height: 1px;
  margin: 24px auto 18px;
  background-color: var(--vp-c-divider);
}

.quote {
  max-width: 256px;
  margin: 0 auto;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.action {
  padding-top: 20px;
}

.link {
  display: inline-block;
  padding: 3px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand);
  border: 1px solid var(--vp-c-brand);
  border-radius: 16px;
  transition:
    border-color 0.25s,
    color 0.25s;
}

.link:hover {
  color: var(--vp-c-brand-dark);
  border-color: var(--vp-c-brand-dark);
}
</style>
