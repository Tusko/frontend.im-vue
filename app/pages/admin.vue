<script setup lang="ts">
type Row = Record<string, any>;
type Section = "projects" | "experience" | "other" | "seo";

const sections: { key: Section; label: string }[] = [
  { key: "projects", label: "Projects" },
  { key: "experience", label: "Experience" },
  { key: "other", label: "Other projects" },
  { key: "seo", label: "SEO" },
];

const section = ref<Section>("projects");
const rows = ref<Row[]>([]);
const otherProjects = ref("");
type SeoPage = { title: string; description: string; image: string };
const seo = ref<{ pages: Record<string, SeoPage>; meta: { name: string; content: string }[]; profiles: string[] } | null>(null);
const jsonld = ref(""); // edited as text, parsed on save
const openKey = ref<string | number | null>(null);
const busy = ref(false);
const status = ref<{ text: string; error?: boolean } | null>(null);
const counts = reactive<Partial<Record<Section, number>>>({});

useHead({ title: "Admin", meta: [{ name: "robots", content: "noindex" }] });

let toastTimer: ReturnType<typeof setTimeout>;
function say(text: string, error = false) {
  status.value = { text, error };
  clearTimeout(toastTimer);
  if (!error) toastTimer = setTimeout(() => (status.value = null), 3000);
}
const fail = (e: any) =>
  say(
    e?.statusCode === 401 || e?.status === 401
      ? "You're signed out. Reload the page to sign in with Cloudflare Access."
      : e?.data?.statusMessage || e?.statusMessage || e?.message || "Something went wrong",
    true
  );

// API <-> form: YYYYMMDD <-> YYYY-MM-DD
let newId = 0;
const keyOf = (r: Row) => r.id ?? r._key;
const toForm = (r: Row): Row => ({
  ...r,
  ...(r.posted_at && { posted_at: String(r.posted_at).replace(/^(\d{4})(\d\d)(\d\d)$/, "$1-$2-$3") }),
});
const toApi = ({ _key, ...r }: Row): Row => {
  if ("posted_at" in r) r.posted_at = String(r.posted_at ?? "").replaceAll("-", "");
  return r;
};

async function load() {
  openKey.value = null;
  try {
    if (section.value === "other" || section.value === "seo") {
      const settings = await $fetch<{ other_projects: string; seo: any }>("/api/admin/settings");
      otherProjects.value = settings.other_projects;
      // Pages the site renders always get a form, even before anything is saved for them
      const blank = { title: "", description: "", image: "" };
      seo.value = { ...settings.seo, pages: { "/": { ...blank }, "/cv": { ...blank }, ...settings.seo.pages } };
      jsonld.value = settings.seo.jsonld ? JSON.stringify(settings.seo.jsonld, null, 2) : "";
    } else {
      rows.value = (await $fetch<Row[]>(`/api/admin/${section.value}`)).map(toForm);
      counts[section.value] = rows.value.length;
    }
  } catch (e) {
    fail(e);
  }
}
onMounted(load);
watch(section, load);

const toggle = (r: Row) => (openKey.value = openKey.value === keyOf(r) ? null : keyOf(r));

function add() {
  const row: Row = { _key: `new-${++newId}`, sort: (rows.value[0]?.sort ?? 1) - 1 };
  if (section.value === "projects") Object.assign(row, { title: "", url: "", cats: [], posted_at: "", thumbnail: "", cover: "", soon: 0 });
  rows.value.unshift(row);
  openKey.value = row._key;
}

async function save(r: Row, quiet = false) {
  busy.value = true;
  try {
    const saved = toForm(await $fetch<Row>(`/api/admin/${section.value}`, { method: "POST", body: toApi(r) }));
    const wasOpen = openKey.value === keyOf(r);
    rows.value[rows.value.indexOf(r)] = saved;
    if (wasOpen) openKey.value = saved.id;
    counts[section.value as "projects"] = rows.value.length;
    if (!quiet) say("Saved");
  } catch (e) {
    fail(e);
  } finally {
    busy.value = false;
  }
}

async function remove(r: Row) {
  if (!confirm(`Delete "${r.title || r.company || "this entry"}"? This can't be undone.`)) return;
  try {
    if (r.id) await $fetch(`/api/admin/${section.value}`, { method: "DELETE", query: { id: r.id } });
    rows.value.splice(rows.value.indexOf(r), 1);
    counts[section.value as "projects"] = rows.value.length;
    say("Deleted");
  } catch (e) {
    fail(e);
  }
}

// Swap sort with the neighbour and save both
async function move(r: Row, d: -1 | 1) {
  const i = rows.value.indexOf(r);
  const other = rows.value[i + d];
  if (!other) return;
  [r.sort, other.sort] = [other.sort, r.sort];
  if (r.sort === other.sort) r.sort += d;
  [rows.value[i], rows.value[i + d]] = [other, r];
  if (r.id) await save(r, true);
  if (other.id) await save(other, true);
  say("Order saved");
}

// Drag to reorder: rows move live while dragging, then changed sorts are saved on drop.
// Only the grip starts a drag, so text selection inside the open form keeps working.
const grabbed = ref<Row | null>(null);
const dragging = ref<Row | null>(null);
function dragOver(target: Row) {
  const from = rows.value.indexOf(dragging.value!);
  const to = rows.value.indexOf(target);
  if (from < 0 || from === to) return;
  rows.value.splice(to, 0, rows.value.splice(from, 1)[0]!);
}
async function dropped() {
  dragging.value = grabbed.value = null;
  const changed = rows.value.filter((r, i) => r.sort !== i + 1 && (r.sort = i + 1));
  await Promise.all(changed.filter((r) => r.id).map((r) => save(r, true)));
  if (changed.length) say("Order saved");
}

// Center-crop to a square and scale down to `max` px, in the browser
async function square(file: File, max: number) {
  const img = await createImageBitmap(file);
  const side = Math.min(img.width, img.height);
  const size = Math.min(side, max);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
  img.close();
  return new Promise<Blob>((ok, no) => canvas.toBlob((b) => (b ? ok(b) : no(new Error("Couldn't process the image"))), "image/webp", 0.86));
}

async function uploadBlob(blob: Blob) {
  const body = new FormData();
  body.append("file", blob, `image.${blob.type.split("/")[1]}`);
  return (await $fetch<{ url: string }>("/api/admin/upload", { method: "POST", body })).url;
}

const IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/avif,image/gif";
const fileDrag = ref(false);
// A file dropped outside the drop zone would navigate away and lose unsaved edits
const blockFileDrop = (e: DragEvent) => e.dataTransfer?.types.includes("Files") && e.preventDefault();
onMounted(() => ["dragover", "drop"].forEach((t) => window.addEventListener(t, blockFileDrop as EventListener)));
onUnmounted(() => ["dragover", "drop"].forEach((t) => window.removeEventListener(t, blockFileDrop as EventListener)));

function pickImage(e: Event, r: Row) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (file) replaceImage(file, r);
}
function dropImage(e: DragEvent, r: Row) {
  fileDrag.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) replaceImage(file, r);
}

async function replaceImage(file: File, r: Row) {
  // Drops skip the input's accept filter
  if (!IMAGE_TYPES.split(",").includes(file.type)) return say("Use a PNG, JPEG, WebP, AVIF or GIF image.", true);
  if (busy.value) return;
  busy.value = true;
  try {
    const [cover, thumbnail] = await Promise.all([square(file, 1024), square(file, 256)]);
    [r.cover, r.thumbnail] = await Promise.all([uploadBlob(cover), uploadBlob(thumbnail)]);
    say("Image ready. Save the project to publish it.");
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}

async function saveOther() {
  busy.value = true;
  try {
    await $fetch("/api/admin/settings", { method: "PUT", body: { other_projects: otherProjects.value } });
    say("Saved");
  } catch (e) {
    fail(e);
  } finally {
    busy.value = false;
  }
}

// JSON-LD must be a single JSON object (a @graph holds several entities)
const jsonldError = computed(() => {
  if (!jsonld.value.trim()) return "";
  try {
    const v = JSON.parse(jsonld.value);
    return v && typeof v === "object" && !Array.isArray(v) ? "" : "Must be a JSON object, e.g. { \"@context\": … }";
  } catch (e: any) {
    return e.message;
  }
});
const formatJsonld = () => !jsonldError.value && jsonld.value.trim() && (jsonld.value = JSON.stringify(JSON.parse(jsonld.value), null, 2));

async function saveSeo() {
  if (jsonldError.value) return say(`JSON-LD: ${jsonldError.value}`, true);
  busy.value = true;
  try {
    const body = { seo: { ...seo.value, jsonld: jsonld.value.trim() ? JSON.parse(jsonld.value) : null } };
    await $fetch("/api/admin/settings", { method: "PUT", body });
    say("SEO saved");
  } catch (e) {
    fail(e);
  } finally {
    busy.value = false;
  }
}

async function pickShareImage(e: Event, p: SeoPage) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file || busy.value) return;
  busy.value = true;
  try {
    p.image = await uploadBlob(file);
    say("Image ready. Save to publish it.");
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}

// Every category already in use, for autocomplete
const allCats = computed(() => [...new Set(rows.value.flatMap((r) => r.cats ?? []))].sort());

const year = (d?: string) => d?.slice(0, 4) ?? "";
const heading = computed(() => sections.find((s) => s.key === section.value)!.label);
const summary = computed(() => {
  if (section.value === "other") return "Free-form text shown under the project grid on the home page.";
  if (section.value === "seo") return "What search engines, link previews and AI assistants see. Empty fields fall back to the defaults.";
  const n = rows.value.length;
  const noun = section.value === "projects" ? "project" : "position";
  const drag = section.value === "projects" ? "drag a closed tile" : "drag the dots";
  return n ? `${n} ${noun}${n === 1 ? "" : "s"}. Select one to edit it, or ${drag} to reorder.` : "";
});
</script>

<template>
  <div class="admin">
    <aside class="rail">
      <a href="/" class="brand" target="_blank" rel="noopener">frontend.im</a>
      <nav aria-label="Sections">
        <button
          v-for="s in sections"
          :key="s.key"
          type="button"
          :aria-current="section === s.key ? 'page' : undefined"
          @click="section = s.key"
        >
          <span>{{ s.label }}</span>
          <small v-if="counts[s.key] !== undefined">{{ counts[s.key] }}</small>
        </button>
      </nav>
      <a href="/" class="rail-foot" target="_blank" rel="noopener">Open the site</a>
    </aside>

    <main class="stage">
      <header class="stage-head">
        <div>
          <h1>{{ heading }}</h1>
          <p>{{ summary }}</p>
        </div>
        <button v-if="section === 'projects' || section === 'experience'" type="button" class="btn primary" @click="add">
          {{ section === "projects" ? "Add project" : "Add position" }}
        </button>
      </header>

      <!-- Projects: square previews; the open one expands a full-width panel under its row -->
      <ul v-if="section === 'projects'" class="tiles">
        <template v-for="r in rows" :key="keyOf(r)">
          <!-- tiles drag to reorder only while every project is collapsed -->
          <li
            class="tile"
            :class="{ open: openKey === keyOf(r), dragging: dragging === r, sortable: openKey === null }"
            :draggable="openKey === null"
            @dragstart="dragging = r; $event.dataTransfer!.effectAllowed = 'move'"
            @dragover.prevent="dragging && dragOver(r)"
            @dragend="dropped"
          >
            <button type="button" :aria-expanded="openKey === keyOf(r)" @click="toggle(r)">
              <img v-if="r.thumbnail || r.cover" :src="r.thumbnail || r.cover" alt="" loading="lazy" draggable="false" />
              <span v-else class="tile-blank">{{ (r.title || "New")[0] }}</span>
              <span class="tile-title" v-html="r.title || 'Untitled project'" />
              <span class="tile-meta">{{ [year(r.posted_at), r.soon && "Soon"].filter(Boolean).join(" · ") }}</span>
            </button>
          </li>
          <li v-if="openKey === keyOf(r)" class="detail">
            <form @submit.prevent="save(r)">
              <div
                class="detail-image"
                :class="{ 'drop-active': fileDrag }"
                @dragover.prevent="fileDrag = $event.dataTransfer!.types.includes('Files')"
                @dragleave="fileDrag = false"
                @drop.prevent="dropImage($event, r)"
              >
                <img v-if="r.cover || r.thumbnail" :src="r.cover || r.thumbnail" alt="" />
                <span v-else class="tile-blank">No image</span>
                <label class="btn">
                  {{ r.cover ? "Replace image" : "Upload image" }}
                  <input type="file" :accept="IMAGE_TYPES" class="sr-only" @change="pickImage($event, r)" />
                </label>
                <p class="hint">Or drop an image here. Cropped to a square, up to 1024 × 1024.</p>
              </div>
              <div class="fields">
                <label class="field wide">Title <input v-model="r.title" required /></label>
                <label class="field wide">Site URL <input v-model="r.url" type="url" placeholder="https://" /></label>
                <div class="field wide">
                  <span>Categories</span>
                  <AdminTagInput v-model="r.cats" :suggestions="allCats" :list-id="`cats-${keyOf(r)}`" />
                </div>
                <label class="field">Published <input v-model="r.posted_at" type="date" /></label>
                <label class="field check"><input v-model="r.soon" type="checkbox" :true-value="1" :false-value="0" /> Soon (listed, not linked)</label>
                <div class="actions">
                  <button type="submit" class="btn primary" :disabled="busy">Save project</button>
                  <button type="button" class="btn" :disabled="busy || rows.indexOf(r) === 0" @click="move(r, -1)">Move earlier</button>
                  <button type="button" class="btn" :disabled="busy || rows.indexOf(r) === rows.length - 1" @click="move(r, 1)">Move later</button>
                  <button type="button" class="btn danger" @click="remove(r)">Delete</button>
                </div>
              </div>
            </form>
          </li>
        </template>
      </ul>

      <!-- Experience: a timeline of positions; the open one unfolds its editor -->
      <ol v-else-if="section === 'experience'" class="entries">
        <li
          v-for="r in rows"
          :key="keyOf(r)"
          class="entry"
          :class="{ open: openKey === keyOf(r), dragging: dragging === r }"
          :draggable="grabbed === r"
          @dragstart="dragging = r; $event.dataTransfer!.effectAllowed = 'move'"
          @dragover.prevent="dragging && dragOver(r)"
          @dragend="dropped"
        >
          <div class="entry-head">
            <span
              class="grip"
              title="Drag to reorder"
              aria-hidden="true"
              @pointerdown="grabbed = r"
              @pointerup="dragging || (grabbed = null)"
            />
            <button type="button" class="entry-face" :aria-expanded="openKey === keyOf(r)" @click="toggle(r)">
              <strong>{{ r.company || "New position" }}</strong>
              <span>{{ r.position }}</span>
              <time>{{ r.years }}</time>
            </button>
          </div>
          <form v-if="openKey === keyOf(r)" class="fields entry-body" @submit.prevent="save(r)">
            <label class="field">Company <input v-model="r.company" required /></label>
            <label class="field">Company URL <input v-model="r.company_url" type="url" placeholder="https://" /></label>
            <label class="field">About the company <input v-model="r.company_desc" /></label>
            <label class="field">Position <input v-model="r.position" /></label>
            <label class="field">Years <input v-model="r.years" placeholder="08.2025 / Present" /></label>
            <div class="field wide">
              <span>Responsibilities</span>
              <AdminHtmlEditor v-model="r.list" label="Responsibilities" />
            </div>
            <div class="actions">
              <button type="submit" class="btn primary" :disabled="busy">Save position</button>
              <button type="button" class="btn" :disabled="busy || rows.indexOf(r) === 0" @click="move(r, -1)">Move earlier</button>
              <button type="button" class="btn" :disabled="busy || rows.indexOf(r) === rows.length - 1" @click="move(r, 1)">Move later</button>
              <button type="button" class="btn danger" @click="remove(r)">Delete</button>
            </div>
          </form>
        </li>
      </ol>

      <form v-else-if="section === 'seo'" class="seo" @submit.prevent="saveSeo">
        <template v-if="seo">
          <section v-for="(p, path) in seo.pages" :key="path" class="panel">
            <h2>Page <code>{{ path }}</code></h2>
            <!-- Rough Google result preview -->
            <div class="serp" aria-hidden="true">
              <span class="serp-url">frontend.im{{ path === "/" ? "" : path }}</span>
              <span class="serp-title">{{ p.title || "(default title)" }}</span>
              <span class="serp-desc">{{ p.description || "(default description)" }}</span>
            </div>
            <div class="fields">
              <label class="field wide">
                <span>Title <small :class="{ over: p.title.length > 60 }">{{ p.title.length }}/60</small></span>
                <input v-model="p.title" maxlength="200" />
              </label>
              <label class="field wide">
                <span>Description <small :class="{ over: p.description.length > 160 }">{{ p.description.length }}/160</small></span>
                <textarea v-model="p.description" rows="3" maxlength="500" />
              </label>
              <label class="field wide">
                Share image (link previews; 1200 × 630 works best, empty uses the GitHub avatar)
                <span class="row-inline">
                  <input v-model="p.image" placeholder="/media/… or https://" />
                  <label class="btn">
                    Upload
                    <input type="file" :accept="IMAGE_TYPES" class="sr-only" @change="pickShareImage($event, p)" />
                  </label>
                </span>
              </label>
            </div>
          </section>

          <section class="panel">
            <h2>Meta tags</h2>
            <p class="hint">Added to every page, e.g. <code>google-site-verification</code>.</p>
            <div v-for="(m, i) in seo.meta" :key="i" class="fields meta-row">
              <label class="field">Name <input v-model="m.name" placeholder="google-site-verification" /></label>
              <label class="field">Content <input v-model="m.content" /></label>
              <button type="button" class="btn danger" @click="seo.meta.splice(i, 1)">Remove</button>
            </div>
            <div class="actions">
              <button type="button" class="btn" @click="seo.meta.push({ name: '', content: '' })">Add meta tag</button>
            </div>
          </section>

          <section class="panel">
            <h2>Profiles</h2>
            <p class="hint">
              Your accounts elsewhere (GitHub, Instagram, LinkedIn…). Added as <code>sameAs</code> to the Person in the
              JSON-LD below, so search engines and AI assistants link them to you.
            </p>
            <div v-for="(_, i) in seo.profiles" :key="i" class="row-inline">
              <input v-model="seo.profiles[i]" type="url" placeholder="https://" :aria-label="`Profile ${i + 1}`" />
              <button type="button" class="btn danger" @click="seo.profiles.splice(i, 1)">Remove</button>
            </div>
            <div class="actions">
              <button type="button" class="btn" @click="seo.profiles.push('')">Add profile</button>
            </div>
          </section>

          <section class="panel">
            <h2>Structured data (JSON-LD)</h2>
            <p class="hint">
              Added to every page. Check it with
              <a href="https://validator.schema.org/" target="_blank" rel="noopener">validator.schema.org</a> after saving.
            </p>
            <textarea v-model="jsonld" class="code" rows="24" spellcheck="false" :aria-invalid="!!jsonldError" />
            <p v-if="jsonldError" class="hint error">{{ jsonldError }}</p>
            <div class="actions">
              <button type="button" class="btn" :disabled="!!jsonldError" @click="formatJsonld">Format</button>
            </div>
          </section>

          <div class="actions">
            <button type="submit" class="btn primary" :disabled="busy || !!jsonldError">Save SEO</button>
          </div>
        </template>
      </form>

      <form v-else class="panel" @submit.prevent="saveOther">
        <AdminHtmlEditor v-model="otherProjects" label="Other projects" />
        <div class="actions">
          <button type="submit" class="btn primary" :disabled="busy">Save text</button>
        </div>
      </form>

      <p v-if="(section === 'projects' || section === 'experience') && !rows.length" class="empty">
        Nothing here yet. Use “{{ section === "projects" ? "Add project" : "Add position" }}” to create the first one.
      </p>
    </main>

    <p class="toast" :class="{ error: status?.error, shown: status }" role="status" aria-live="polite">
      {{ status?.text }}
      <button v-if="status?.error" type="button" aria-label="Dismiss" @click="status = null">×</button>
    </p>
  </div>
</template>

<style scoped lang="scss">
.admin {
  --canvas: #eef2f6;
  --surface: #fff;
  --ink: #1a1e22;
  --muted: #5b6672;
  --line: #dbe2ea;
  --primary: #0070f3;
  --primary-tint: #e6f0fe;
  --teal: #119da4;
  --danger: #c9304f;

  display: grid;
  grid-template-columns: 232px 1fr;
  min-height: 100vh;
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font2);
  font-size: 15px;
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
}

/* Rail */
.rail {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px 16px;
  background: var(--surface);
  border-right: 1px solid var(--line);
  @media (max-width: 760px) {
    position: static;
    height: auto;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  nav {
    display: grid;
    gap: 4px;
    @media (max-width: 760px) {
      display: flex;
      order: 3;
      width: 100%;
      overflow-x: auto;
    }
  }
  nav button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: none;
    color: var(--muted);
    font: inherit;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
    &:hover {
      color: var(--ink);
      background: var(--canvas);
    }
    &[aria-current="page"] {
      background: var(--primary);
      color: #fff;
      small {
        background: rgb(255 255 255 / 0.22);
        color: #fff;
      }
    }
    small {
      min-width: 26px;
      padding: 1px 8px;
      border-radius: 999px;
      background: var(--primary-tint);
      color: var(--primary);
      font-size: 12px;
      text-align: center;
    }
  }
}
.brand {
  padding: 0 14px;
  font-family: var(--font);
  font-weight: 600;
  font-size: 18px;
  color: var(--ink);
  text-decoration: none;
  &::before {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 24px;
    border-radius: 50%;
    background: var(--teal);
    box-shadow: 14px 0 0 var(--primary);
  }
}
.rail-foot {
  margin-top: auto;
  padding: 0 14px;
  color: var(--muted);
  font-size: 14px;
  @media (max-width: 760px) {
    margin: 0 0 0 auto;
  }
}

/* Stage */
.stage {
  padding: 32px clamp(16px, 4vw, 48px) 96px;
  min-width: 0;
}
.stage-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  max-width: 1200px;
  h1 {
    font-size: 30px;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.01em;
  }
  p {
    margin-top: 6px;
    color: var(--muted);
  }
}

/* Project tiles */
.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  grid-auto-flow: dense; // later tiles backfill the open tile's row; the panel takes the next row
  gap: 16px;
  max-width: 1200px;
  list-style: none;
}
.tile {
  position: relative;
  z-index: 0; // own stacking context so the notch stays above the panel
  > button {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    border-radius: 14px;
    overflow: hidden;
    background: var(--surface);
    box-shadow: 0 1px 2px rgb(26 30 34 / 0.06), 0 2px 8px rgb(26 30 34 / 0.05);
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: box-shadow 0.15s, transform 0.15s;
    &:hover {
      box-shadow: 0 2px 4px rgb(26 30 34 / 0.08), 0 8px 20px rgb(26 30 34 / 0.08);
    }
  }
  img {
    display: block;
    object-fit: cover;
  }
  img,
  .tile-blank {
    width: 100%;
    aspect-ratio: 1;
    background: var(--canvas);
  }
  .tile-title {
    // titles may carry a <br><small> subtitle from WordPress; keep tiles one line
    :deep(br),
    :deep(small) {
      display: none;
    }
    display: block;
    padding: 10px 12px 0;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile-meta {
    display: block;
    min-height: 1.4em;
    padding: 0 12px 10px;
    color: var(--muted);
    font-size: 13px;
  }
  &.open > button {
    outline: 3px solid var(--teal);
    outline-offset: 2px;
  }
  &.sortable > button {
    cursor: grab;
  }
  // the dragged tile stays in the grid as a slot showing where it will land
  &.dragging > button {
    outline: 2px dashed var(--primary);
    outline-offset: 2px;
    opacity: 0.35;
  }
  // notch that points from the open tile to its panel
  &.open::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -29px;
    z-index: 1;
    width: 24px;
    height: 24px;
    background: var(--surface);
    transform: translateX(-50%) rotate(45deg);
    border-radius: 3px 0 0 0;
  }
}
.tile-blank {
  display: grid;
  place-items: center;
  color: var(--muted);
  font-size: 28px;
  font-weight: 600;
}
.detail {
  grid-column: 1 / -1;
  padding: 24px;
  border-radius: 18px;
  background: var(--surface);
  box-shadow: 0 2px 4px rgb(26 30 34 / 0.06), 0 12px 32px rgb(26 30 34 / 0.08);
  animation: unfold 0.18s ease-out;
  form {
    display: grid;
    grid-template-columns: minmax(180px, 280px) 1fr;
    gap: 28px;
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
}
.detail-image {
  display: grid;
  gap: 10px;
  align-content: start;
  border-radius: 14px;
  &.drop-active {
    outline: 2px dashed var(--primary);
    outline-offset: 4px;
    background: var(--primary-tint);
  }
  img,
  .tile-blank {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 12px;
    background: var(--canvas);
    font-size: 15px;
  }
  .btn {
    justify-self: start;
  }
}
.hint {
  color: var(--muted);
  font-size: 13px;
}

/* Experience entries */
.entries {
  display: grid;
  gap: 10px;
  max-width: 960px;
  list-style: none;
}
.entry {
  border-radius: 14px;
  background: var(--surface);
  box-shadow: 0 1px 2px rgb(26 30 34 / 0.06);
  border-left: 4px solid transparent;
  &.open {
    border-left-color: var(--teal);
    box-shadow: 0 2px 4px rgb(26 30 34 / 0.06), 0 12px 32px rgb(26 30 34 / 0.08);
  }
  // the dragged row stays in the list as a dashed slot showing where it will land
  &.dragging {
    background: var(--primary-tint);
    box-shadow: inset 0 0 0 2px var(--primary);
    border-left-color: var(--primary);
    > * {
      opacity: 0.35;
    }
  }
}
.entry-head {
  display: flex;
  align-items: center;
}
// six-dot grip drawn with two dotted columns
.grip {
  flex: none;
  align-self: stretch;
  width: 28px;
  margin-left: 6px;
  cursor: grab;
  background:
    radial-gradient(circle, var(--muted) 1.5px, transparent 2px) 8px 50% / 6px 6px repeat-y,
    radial-gradient(circle, var(--muted) 1.5px, transparent 2px) 14px 50% / 6px 6px repeat-y;
  background-size: 6px 6px;
  mask: linear-gradient(transparent calc(50% - 9px), #000 calc(50% - 9px), #000 calc(50% + 9px), transparent calc(50% + 9px));
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
  &:active {
    cursor: grabbing;
  }
}
.entry-face {
  display: grid;
  grid-template-columns: minmax(8em, 14em) 1fr auto;
  gap: 16px;
  align-items: baseline;
  width: 100%;
  padding: 16px 20px 16px 6px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  strong {
    font-weight: 600;
    font-size: 16px;
  }
  span {
    color: var(--muted);
  }
  time {
    color: var(--muted);
    font-size: 13px;
    white-space: nowrap;
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
.entry-body {
  padding: 4px 20px 20px 40px;
  animation: unfold 0.18s ease-out;
}

/* Forms */
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-content: start;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}
.field {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  &.wide {
    grid-column: 1 / -1;
  }
  &.check {
    display: flex;
    align-items: center;
    gap: 8px;
    align-self: end;
    padding-bottom: 10px;
    input {
      padding: 0;
      width: 18px;
      height: 18px;
      accent-color: var(--primary);
    }
  }
  input {
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 15px;
    font-weight: 400;
    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-tint);
    }
  }
}
.panel {
  display: grid;
  gap: 16px;
  max-width: 960px;
  padding: 24px;
  border-radius: 18px;
  background: var(--surface);
  box-shadow: 0 1px 2px rgb(26 30 34 / 0.06);
}
/* SEO */
.seo {
  display: grid;
  gap: 20px;
  max-width: 960px;
  h2 {
    font-size: 18px;
    font-weight: 600;
  }
  code {
    font-family: var(--font);
    font-size: 0.9em;
  }
  .field > span {
    display: flex;
    justify-content: space-between;
  }
  small {
    font-weight: 400;
    &.over {
      color: var(--danger);
    }
  }
}
.serp {
  display: grid;
  gap: 2px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  font-family: Arial, sans-serif;
  .serp-url {
    color: #202124;
    font-size: 13px;
  }
  .serp-title {
    color: #1a0dab;
    font-size: 19px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .serp-desc {
    color: #4d5156;
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
.row-inline {
  display: flex;
  gap: 8px;
  .btn.danger {
    margin-left: 0;
  }
  input:not(.sr-only) {
    flex: 1;
  }
}
.meta-row {
  grid-template-columns: 1fr 2fr auto;
  align-items: end;
  .btn.danger {
    margin-left: 0;
  }
}
.field textarea,
.row-inline > input,
textarea.code {
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  font-size: 15px;
  font-weight: 400;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-tint);
  }
}
textarea.code {
  font-family: var(--font);
  font-size: 13px;
  line-height: 1.5;
  tab-size: 2;
  &[aria-invalid="true"] {
    border-color: var(--danger);
  }
}
.hint.error {
  color: var(--danger);
}
.actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.btn {
  display: inline-flex;
  align-items: center;
  padding: 9px 18px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  &:hover:not(:disabled) {
    border-color: var(--muted);
  }
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
  &.primary {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
    &:hover:not(:disabled) {
      background: #005fd0;
    }
  }
  &.danger {
    margin-left: auto;
    color: var(--danger);
    &:hover:not(:disabled) {
      border-color: var(--danger);
    }
  }
}
.admin :is(button, a, input, label):focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
}
.btn:focus-within {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.empty {
  max-width: 40em;
  padding: 40px 0;
  color: var(--muted);
}

/* Toast */
.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(420px, calc(100vw - 48px));
  padding: 12px 18px;
  border-radius: 12px;
  background: var(--ink);
  color: #fff;
  box-shadow: 0 8px 24px rgb(26 30 34 / 0.25);
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  &.shown {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
  &.error {
    background: var(--danger);
  }
  button {
    border: 0;
    background: none;
    color: inherit;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }
}

@keyframes unfold {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .detail,
  .entry-body {
    animation: none;
  }
  .toast,
  .tile > button {
    transition: none;
  }
}
</style>
