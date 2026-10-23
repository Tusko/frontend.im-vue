<script setup lang="ts">
const model = defineModel<string>({ default: "" });
const props = defineProps<{ label: string }>();
const el = ref<HTMLElement>();

// ponytail: contenteditable + execCommand (deprecated but in every browser) instead of a rich-text lib;
// switch to Tiptap if the toolbar ever needs more than this
const tools = [
  { label: "Heading", cmd: "formatBlock", arg: "h3" },
  { label: "Bold", cmd: "bold" },
  { label: "Italic", cmd: "italic" },
  { label: "Link", cmd: "createLink" },
  { label: "• List", cmd: "insertUnorderedList" },
  { label: "1. List", cmd: "insertOrderedList" },
  { label: "Clear", cmd: "removeFormat" },
];

// Browsers type spaces next to each other as &nbsp;, which stops text from wrapping on the site
let emitted: string | undefined;
const sync = () => {
  const html = el.value!.textContent?.trim() ? el.value!.innerHTML.replaceAll("&nbsp;", " ") : "";
  model.value = emitted = html;
};

function run({ cmd, arg }: { cmd: string; arg?: string }) {
  el.value!.focus();
  if (cmd === "createLink") {
    const url = prompt("Link URL", "https://");
    if (!url || !/^(https?:|mailto:|\/)/i.test(url)) return;
    arg = url;
  }
  document.execCommand(cmd, false, arg);
  sync();
}

// Paste as plain text so Word/Docs styling doesn't end up on the site
function paste(e: ClipboardEvent) {
  e.preventDefault();
  document.execCommand("insertText", false, e.clipboardData?.getData("text/plain") ?? "");
}

onMounted(() => document.execCommand("defaultParagraphSeparator", false, "p"));
// Content can arrive after mount (loaded from the API); reload unless the change came from typing
watch([model, el], ([html]) => el.value && html !== emitted && (el.value.innerHTML = emitted = html ?? ""), {
  immediate: true,
  flush: "post",
});
</script>

<template>
  <div class="html-editor">
    <div class="toolbar" role="toolbar" :aria-label="`${props.label} formatting`">
      <button v-for="t in tools" :key="t.cmd" type="button" @mousedown.prevent @click="run(t)">{{ t.label }}</button>
    </div>
    <div
      ref="el"
      class="content"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      :aria-label="props.label"
      @input="sync"
      @paste="paste"
    />
  </div>
</template>

<style scoped lang="scss">
.html-editor {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font-weight: 400;
  &:focus-within {
    border-color: var(--primary);
  }
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px;
  border-bottom: 1px solid var(--line);
  button {
    padding: 4px 10px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    &:hover,
    &:focus-visible {
      border-color: var(--line);
    }
  }
}
.content {
  min-height: 10em;
  max-height: 28em;
  overflow-y: auto;
  padding: 12px 15px;
  font-size: 15px;
  line-height: 1.55;
  outline: none;
  :deep(ul),
  :deep(ol) {
    padding-left: 1.5em;
  }
}
</style>
