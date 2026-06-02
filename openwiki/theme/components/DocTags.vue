<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const { frontmatter } = useData();

const tags = computed(() => frontmatter.value?.tags ?? []);
const aliases = computed(() => frontmatter.value?.aliases ?? []);
const createdAt = computed(() => frontmatter.value?.created_at ?? null);
const updatedAt = computed(() => frontmatter.value?.updated_at ?? null);
const hasTags = computed(() => tags.value.length > 0);
const hasTime = computed(() => createdAt.value || updatedAt.value);

function formatDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date as string;
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
</script>

<template>
  <div class="doc-tags-wrapper">
    <div v-if="hasTime" class="doc-meta-time">
      <span v-if="createdAt">创建于 {{ formatDate(createdAt) }}</span>
      <span v-if="createdAt && updatedAt"> · </span>
      <span v-if="updatedAt">更新于 {{ formatDate(updatedAt) }}</span>
    </div>
    <div v-if="hasTags" class="doc-tags">
      <span v-for="tag in tags" :key="tag" class="doc-tag"># {{ tag }}</span>
    </div>
    <div v-if="aliases.length > 0" class="doc-meta-aliases">
      <span v-for="alias in aliases" :key="alias" class="doc-meta-alias">{{
        alias
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.doc-tags-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doc-meta-time {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.doc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.doc-meta-aliases {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.doc-meta-alias {
  display: inline-block;
  padding: 0 10px;
  line-height: 22px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}

.doc-tag {
  display: inline-block;
  padding: 0 10px;
  line-height: 22px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}
</style>
