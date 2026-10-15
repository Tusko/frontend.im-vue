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
  quill.clipboard.dangerouslyPasteHTML(model.value);
  // Quill 2 emits clean HTML (real <ul>/<ol>) from getSemanticHTML
  quill.on("text-change", () => (model.value = quill.getLength() > 1 ? quill.getSemanticHTML() : ""));
});
</script>

<template>
  <div class="html-editor"><div ref="el" /></div>
</template>

<style scoped lang="scss">
.html-editor {
  border-radius: 8px;
  background: var(--surface);
  :deep(.ql-toolbar) {
    border: 1px solid var(--line);
    border-radius: 8px 8px 0 0;
  }
  :deep(.ql-container) {
    border: 1px solid var(--line);
    border-top: 0;
    border-radius: 0 0 8px 8px;
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
