<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import DocTags from './components/DocTags.vue'
import DocMetaEx from './components/DocMetaEx.vue'

const { frontmatter } = useData()
const tags = computed(() => frontmatter.value?.tags ?? [])
const hasTags = computed(() => tags.value.length > 0)
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <DocTags v-if="hasTags" style="margin-bottom: 24px;" />
    </template>
    <template #aside-outline-after>
      <DocMetaEx style="margin-top: 24px; padding-left: 16px;"/>
    </template>
  </DefaultTheme.Layout>
</template>