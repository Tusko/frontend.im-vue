<script setup lang="ts">
import "quill/dist/quill.snow.css";

const model = defineModel<string>({ default: "" });
const props = defineProps<{ label: string }>();
const el = ref<HTMLElement>();

onMounted(async () => {
  const { default: Quill } = await import("quill");
  const quill = new Quill(el.value!, {
    theme: "snow",
    modules: {
      toolbar: [[{ header: 3 }, "bold", "italic", "link"], [{ list: "bullet" }, { list: "ordered" }], ["clean"]],
    },
  });
  quill.root.setAttribute("aria-label", props.label);
  // Quill 2 emits clean HTML (real <ul>/<ol>) from getSemanticHTML
  let emitted: string | undefined;
  quill.on("text-change", () => (model.value = emitted = quill.getLength() > 1 ? quill.getSemanticHTML() : ""));
  // Content can arrive after mount (e.g. loaded from the API); reload unless the change came from typing
  watch(model, (html) => html !== emitted && quill.clipboard.dangerouslyPasteHTML(html ?? ""), { immediate: true });
});
</script>

<template>
  <div class="html-editor"><div ref="el" /></div>
</template>

<style scoped lang="scss">
.html-editor {
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font-weight: 400;
  :deep(.ql-toolbar) {
    border: 1px solid var(--line);
    border-radius: 8px 8px 0 0;
  }
  :deep(.ql-container) {
    border: 1px solid var(--line);
    border-top: 0;
    border-radius: 0 0 8px 8px;
    height: auto; // Quill's 100% counts the toolbar too and overflows the field
    font: inherit;
    font-size: 15px;
  }
  :deep(.ql-editor) {
    min-height: 10em;
    max-height: 28em;
    line-height: 1.55;
  }
  &:focus-within :deep(.ql-container),
  &:focus-within :deep(.ql-toolbar) {
    border-color: var(--primary);
  }
}
</style>
