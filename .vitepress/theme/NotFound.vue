<script setup lang="ts">
import { useData } from 'vitepress'
import { onMounted, ref } from 'vue'
const { site } = useData()
const sentence = ref('加载中')

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
  <div class="w-full flex flex-col h-full items-center pt-10">
    <p class="font-mono font-semibold text-[64px]/[64px]">404</p>
    <h1 class="pt-3 text-xl font-bold tracking-wider">页面不存在</h1>
    <div class="divider" />
    <blockquote class="quote">
      {{ sentence }}
    </blockquote>
    <!-- <div class="action">
      <a class="link" :href="site.base" aria-label="返回首页"> 返回首页 </a>
    </div> -->
    <VBtn aria-label="返回首页" :href="site.base" class="!no-underline">
      返回首页
    </VBtn>
  </div>
</template>

<style scoped>
.divider {
  width: 64px;
  height: 1px;
  margin: 24px auto 18px;
  background-color: var(--vp-c-divider);
}

.quote {
  @apply mt-0 mx-auto text-sm font-medium;

  color: var(--vp-c-text-2);
}
</style>
