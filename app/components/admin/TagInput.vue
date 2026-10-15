<script setup lang="ts">
const tags = defineModel<string[]>({ default: () => [] });
defineProps<{ suggestions?: string[]; listId: string }>();
const draft = ref("");

function add() {
  const t = draft.value.replace(/,/g, "").trim();
  if (t && !tags.value.some((x) => x.toLowerCase() === t.toLowerCase())) tags.value = [...tags.value, t];
  draft.value = "";
}
const remove = (i: number) => (tags.value = tags.value.filter((_, j) => j !== i));
function onKey(e: KeyboardEvent) {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    add();
  } else if (e.key === "Backspace" && !draft.value && tags.value.length) {
    remove(tags.value.length - 1);
  }
}
</script>

<template>
  <div class="tags">
    <span v-for="(t, i) in tags" :key="t" class="tag">
      {{ t }}
      <button type="button" :aria-label="`Remove ${t}`" @click="remove(i)">×</button>
    </span>
    <input
      v-model="draft"
      :list="listId"
      :placeholder="tags.length ? 'Add…' : 'Type a category, press Enter'"
      @keydown="onKey"
      @change="add"
      @blur="add"
    />
    <datalist :id="listId">
      <option v-for="s in suggestions?.filter((s) => !tags.includes(s))" :key="s" :value="s" />
    </datalist>
  </div>
</template>

<style scoped lang="scss">
.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font-size: 14px;
  font-weight: 400;
  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-tint);
  }
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px 4px 3px 10px;
  border-radius: 999px;
  background: var(--primary-tint);
  color: var(--primary);
  font-weight: 600;
  button {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border: 0;
    border-radius: 50%;
    background: none;
    color: inherit;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    &:hover,
    &:focus-visible {
      background: var(--primary);
      color: #fff;
      outline: none;
    }
  }
}
input {
  flex: 1;
  min-width: 10em;
  padding: 4px 6px;
  border: 0;
  outline: none;
  background: none;
  font: inherit;
  color: inherit;
}
</style>
