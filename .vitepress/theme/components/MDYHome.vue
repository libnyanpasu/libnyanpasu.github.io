<template>
  <v-row>
    <v-col xs="12" sm="12" md="12" lg="12" style="flex-basis: auto">
      <MDYHomeHero />
    </v-col>

    <v-col v-if="loading" xs="12" sm="12" md="12" lg="12">
      <div class="d-flex justify-center w-100">
        <v-progress-circular color="primary" indeterminate />
      </div>
    </v-col>

    <template v-else v-for="[title, item] in Object.entries(items)">
      <v-col xs="12" sm="6" md="4" lg="4">
        <v-card color="MDYBackground" rounded="xl" variant="flat">
          <v-img height="200px" :src="images[title]" cover rounded="xl">
            <div class="d-flex justify-center align-center h-100 logo-title">
              {{ title }}
            </div>
          </v-img>

          <v-card-text>
            <div class="d-flex flex-column" style="gap: 8px">
              <v-btn v-for="{ url, label } in item" :href="url" block>
                {{ label }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </template>
  </v-row>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { useDisplay } from 'vuetify'
import { getLatestRelease } from '../request/github'

const { frontmatter } = useData()

const { sm, xs } = useDisplay()

const loading = ref(true)

const images: {
  [ket: string]: string
} = {
  Windows: '/images/banner/windows.webp',
  Linux: '/images/banner/linux.jpg',
  macOS: '/images/banner/macos.jpg'
}

const items = ref<{
  [key: string]: {
    label: string
    url: string
  }[]
}>({
  Windows: [],
  Linux: [],
  macOS: []
})

const requestRelease = async () => {
  const result = await getLatestRelease()

  result.data.assets.forEach((item) => {
    if (item.name.endsWith('x64-setup.exe')) {
      items.value.Windows.push({
        label: 'Installer (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('x64_portable.zip')) {
      items.value.Windows.push({
        label: 'Portable (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('amd64.AppImage')) {
      items.value.Linux.push({
        label: 'App Image (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('amd64.deb')) {
      items.value.Linux.push({
        label: 'Deb pkg (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('x64.dmg')) {
      items.value.macOS.push({
        label: 'DMG (X64)',
        url: item.browser_download_url
      })
    } else if (item.name.endsWith('aarch64.dmg')) {
      items.value.macOS.push({
        label: 'DMG (ARM64)',
        url: item.browser_download_url
      })
    }
  })

  loading.value = false
}

onMounted(() => {
  requestRelease()
})
</script>

<style scoped lang="scss">
.banner-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 500px;
  padding: 0 36px;
  text-align: center;
  background-image: url('https://lh3.googleusercontent.com/BvKj8kuRZqLpqPuuZxOl4IeHv5jaD5kT1jhn3P8EMBcmzyoHRAFXsCxNH6ZeHhQG4V1F_AegXIw2cJIBmETy7eHM27IdLQe7FqEgz6NLaXflHiHM4xyh=w2400-rj');
  background-position: center;
  background-size: cover;
  border-radius: 24px;

  h1 {
    display: inline;
    font-size: 3rem;
    font-weight: 900;
    line-height: 3rem;
    white-space: nowrap;
  }

  h1.yuzu {
    font-size: 2rem;
    line-height: 2rem;
  }

  h2 {
    font-size: 1.5rem;
    line-height: 1.5rem;
  }
}

.logo-title {
  font-size: 3rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 8px #4c4c4c;
}

@media (width <= 959px) {
  .banner-card {
    height: 420px;

    h1 {
      font-size: 2.5rem;
    }

    h1.yuzu {
      font-size: 1.75rem;
    }
  }
}
</style>
