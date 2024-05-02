<template>
  <v-app>
    <v-navigation-drawer color="MDYBackground" v-model="drawer">
      <MDYNav />
    </v-navigation-drawer>

    <v-app-bar color="MDYBackground" class="text-white">
      <v-app-bar-nav-icon @click="drawer = !drawer" icon="mdi-menu" />

      <v-app-bar-title> Clash Nyanpasu </v-app-bar-title>

      <MDYAppBarLink v-if="!xs" />

      <MDYThemeProvider />

      <MDYAppearance />

      <MDYLanguage />

      <MDYSocialLinks v-if="!xs" />
    </v-app-bar>

    <v-main>
      <div class="base-container">
        <section id="main-section">
          <v-container>
            <MDYContent />

            <MDYFooter />
          </v-container>
        </section>
      </div>
    </v-main>

    <UnoCSSIndicator />
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const drawer = ref(true)

const { xs } = useDisplay()
</script>

<style scoped lang="scss">
.v-navigation-drawer {
  padding-left: 16px;
  border: none;
}

.v-main {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: rgb(var(--v-theme-MDYBackground)) !important;
}

.base-container {
  height: calc(100% - 24px);
  margin: 0 24px 24px;
  overflow: hidden;
  border-radius: 24px;

  > section {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: hidden auto;
    background-color: rgb(var(--v-theme-background)) !important;
    scrollbar-gutter: stable;
  }
}

.v-app-bar {
  padding-right: 12px !important;
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: rgb(var(--v-theme-onSurface)) !important;
  border-radius: 6px;
}

@media (width <= 959px) {
  .base-container {
    height: 100%;
    margin: 0;
    border-radius: 24px 24px 0 0;
  }

  .v-navigation-drawer {
    padding-left: 0;
    border-radius: 0 24px 24px 0;
  }
}
</style>
