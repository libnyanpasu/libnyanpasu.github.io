<script setup lang="ts">
import { useData } from 'vitepress'
// @ts-expect-error
import VPDocFooterLastUpdated from 'vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue'
// @ts-expect-error
import VPLink from 'vitepress/dist/client/theme-default/components/VPLink.vue'
// @ts-expect-error
import { useEditLink } from 'vitepress/dist/client/theme-default/composables/edit-link.js'
// @ts-expect-error
import { usePrevNext } from 'vitepress/dist/client/theme-default/composables/prev-next.js'
import { computed } from 'vue'
import IcBaselineChevronLeft from '~icons/ic/baseline-chevron-left'
import IcBaselineChevronRight from '~icons/ic/baseline-chevron-right'

const { theme, page, frontmatter } = useData()

const editLink = useEditLink()
const control = usePrevNext()

const hasEditLink = computed(
  () => theme.value.editLink && frontmatter.value.editLink !== false
)
const hasLastUpdated = computed(() => page.value.lastUpdated)
const showFooter = computed(
  () =>
    hasEditLink.value ||
    hasLastUpdated.value ||
    control.value.prev ||
    control.value.next
)
</script>

<template>
  <footer v-if="showFooter" class="VPDocFooter">
    <slot name="doc-footer-before" />

    <div v-if="hasEditLink || hasLastUpdated" class="edit-info">
      <div v-if="hasEditLink" class="edit-link">
        <VPLink class="edit-link-button" :href="editLink.url" :no-icon="true">
          <span class="vpi-square-pen edit-link-icon" />
          {{ editLink.text }}
        </VPLink>
      </div>

      <div v-if="hasLastUpdated" class="last-updated">
        <VPDocFooterLastUpdated />
      </div>
    </div>

    <nav
      v-if="control.prev?.link || control.next?.link"
      class="prev-next"
      aria-labelledby="doc-footer-aria-label"
    >
      <span class="visually-hidden" id="doc-footer-aria-label">Pager</span>

      <div class="pager">
        <VPLink
          v-if="control.prev?.link"
          class="pager-link prev"
          :href="control.prev.link"
        >
          <IcBaselineChevronLeft />
          <span class="title" v-html="control.prev.text"></span>
        </VPLink>
      </div>
      <div class="pager">
        <VPLink
          v-if="control.next?.link"
          class="pager-link next"
          :href="control.next.link"
        >
          <span class="title" v-html="control.next.text"></span>
          <IcBaselineChevronRight />
        </VPLink>
      </div>
    </nav>
  </footer>
</template>

<style scoped>
.VPDocFooter {
  margin-top: 32px;
}

/* .edit-info {
    padding-bottom: 18px;
} */

@media (width >= 640px) {
  .edit-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    /* padding-bottom: 14px; */
  }
}

.edit-link-button {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 32px;
  color: var(--vp-c-brand-1);
  text-decoration: none !important;
  border: 0;
  transition: color 0.25s;
}

.edit-link-button:hover {
  color: var(--vp-c-brand-2);
}

.edit-link-icon {
  margin-right: 8px;
}

.prev-next {
  display: flex;
  justify-content: space-between;
}

@media (width >= 640px) {
  .prev-next {
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 16px;
  }
}

.pager-link {
  display: flex;
  gap: 3;
  width: 100%;
  height: 100%;
  text-decoration: none !important;
}

.pager-link:hover {
  border-color: var(--vp-c-brand-1);
}

.pager-link.next {
  margin-left: auto;
  text-align: right;
}

.desc {
  display: block;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  color: var(--vp-c-text-2);
}

.title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--vp-c-brand-1);
  transition: color 0.25s;
}
</style>
