<template>
  <div class="mdy-container">
    <div class="mdy-container-content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.mdy-container {
  position: relative;
  padding: 0 24px;
  margin: 0 auto;

  .mdy-container-content {
    margin: 0 auto;
    max-width: 1152px;
  }
}

@media (min-width: 640px) {
  .mdy-container {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  .mdy-container {
    padding: 0 64px;
  }
}
</style>
