<script setup lang="ts">
const model = defineModel<string>({ default: "" });
const props = defineProps<{ label: string }>();
const el = ref<HTMLElement>();
let view: import("codemirror").EditorView | undefined;
let stop: (() => void) | undefined;
onBeforeUnmount(() => (stop?.(), view?.destroy()));

onMounted(async () => {
  const [{ EditorView, basicSetup }, { json, jsonParseLinter }, { linter, lintGutter }] = await Promise.all([
    import("codemirror"),
    import("@codemirror/lang-json"),
    import("@codemirror/lint"),
  ]);
  const v = (view = new EditorView({
    parent: el.value!,
    doc: model.value,
    extensions: [
      basicSetup,
      json(),
      linter(jsonParseLinter(), { delay: 300 }),
      lintGutter(),
      EditorView.contentAttributes.of({ "aria-label": props.label }),
      EditorView.updateListener.of((u) => u.docChanged && (model.value = u.state.doc.toString())),
    ],
  }));
  // Content arrives after mount (API load) or from the Format button; replace unless it came from typing
  stop = watch(model, (text) => {
    if (text !== v.state.doc.toString()) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } });
  });
});
</script>

<template>
  <div ref="el" class="json-editor" />
</template>

<style scoped lang="scss">
.json-editor {
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface);
  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-tint);
  }
  :deep(.cm-editor) {
    height: 32em;
    font-size: 13px;
    &.cm-focused {
      outline: none;
    }
  }
  :deep(.cm-scroller) {
    font-family: var(--font);
  }
}
</style>
