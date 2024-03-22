<template>
  <Container class="container">
    <div v-if="loading" class="loading">
      <md-circular-progress indeterminate />
    </div>

    <div v-else class="items">
      <md-filled-card class="card">
        <div class="card-content">
          <img
            class="icon"
            src="/images/icons/windows.svg"
            alt="Windows Logo"
          />
          <h2>Windows</h2>
        </div>

        <div class="buttons">
          <md-filled-button v-for="item in items.windows" :href="item.url">
            {{ item.label }}
          </md-filled-button>
        </div>
      </md-filled-card>

      <md-filled-card class="card">
        <div class="card-content">
          <img class="icon" src="/images/icons/linux.svg" alt="Windows Logo" />
          <h2>Linux</h2>
        </div>

        <div class="buttons">
          <md-filled-button v-for="item in items.linux" :href="item.url">
            {{ item.label }}
          </md-filled-button>
        </div>
      </md-filled-card>

      <md-filled-card class="card">
        <div class="card-content">
          <img class="icon" src="/images/icons/apple.svg" alt="Windows Logo" />
          <h2>macOS</h2>
        </div>

        <div class="buttons">
          <md-filled-button v-for="item in items.macos" :href="item.url">
            {{ item.label }}
          </md-filled-button>
        </div>
      </md-filled-card>
    </div>
  </Container>
</template>

<script setup lang="ts">
import '@material/web/button/filled-button.js'
import '@material/web/labs/card/filled-card.js'
import '@material/web/progress/circular-progress.js'
import { getLatestRelease } from '../request/github'

const items = ref<{
  [key: string]: {
    label: string
    url: string
  }[]
}>({
  windows: [],
  linux: [],
  macos: []
})

const loading = ref(true)

onMounted(async () => {
  const result = await getLatestRelease()

  result.data.assets.forEach((item) => {
    if (item.name.endsWith('x64-setup.exe')) {
      items.value.windows.push({
        label: 'Installer (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('x64_portable.zip')) {
      items.value.windows.push({
        label: 'Portable (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('amd64.AppImage')) {
      items.value.linux.push({
        label: 'App Image (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('amd64.deb')) {
      items.value.linux.push({
        label: 'Deb pkg (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('x64.dmg')) {
      items.value.macos.push({
        label: 'DMG (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('aarch64.dmg')) {
      items.value.macos.push({
        label: 'DMG (ARM64)',
        url: item.browser_download_url
      })
    }
  })

  loading.value = false
})
</script>

<style scoped lang="scss">
.items {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 16px;

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.loading {
  display: flex;
  justify-content: center;
}

.card {
  padding: 16px;

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 32px;

    .icon {
      fill: #fff;

      height: 96px;
    }

    h2 {
      font-weight: 700;
      font-size: 24px;
    }
  }
}

@media (max-width: 768px) {
  .items {
    grid-template-columns: 1fr;
  }
}
</style>
