<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const { frontmatter } = useData();

const source = computed(() => frontmatter.value?.source ?? null);
const title = computed(() => frontmatter.value?.title ?? null);
const abstract = computed(() => frontmatter.value?.abstract ?? null);

const hasExtended = computed(
  () => source.value || title.value || abstract.value,
);
</script>

<template>
  <div v-if="hasExtended" class="doc-meta-ex">
    <div v-if="title" class="doc-meta-title">标题：{{ title }}</div>
    <div v-if="source" class="doc-meta-source">
      来源：<a :href="source" target="_blank" rel="noopener noreferrer">{{
        source
      }}</a>
    </div>
    <div v-if="abstract" class="doc-meta-abstract">摘要：{{ abstract }}</div>
  </div>
</template>

<style scoped>
.doc-meta-ex {
  display: flex;
  flex-direction: column;
  line-height: 1.8;
  gap: 8px;
}

.doc-meta-source {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.doc-meta-title {
  font-size: 12px;
  color: var(--vp-c-text-1);
}

.doc-meta-abstract {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
</style>
