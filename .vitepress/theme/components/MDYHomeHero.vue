<template>
  <div class="banner-card text-white">
    <h1>
      {{ frontmatter.hero.name }}
      <span v-if="!(xs || sm)">{{ frontmatter.hero.text }}</span>
    </h1>

    <h1 v-if="xs || sm" class="yuzu">{{ frontmatter.hero.text }}</h1>

    <h2>{{ frontmatter.hero.tagline }}</h2>

    <div class="d-flex flex-column" style="gap: 8px">
      <v-btn
        v-for="item in frontmatter.hero.actions"
        class="rounded-pill"
        size="large"
        :href="item.link"
        :variant="item.theme"
      >
        {{ item.text }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { useDisplay } from 'vuetify'

const { frontmatter } = useData()

const { sm, xs } = useDisplay()
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

  .v-btn {
    padding: 0 64px;
    backdrop-filter: blur(16px);
  }
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
