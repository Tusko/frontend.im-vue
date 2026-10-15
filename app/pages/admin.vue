<script setup lang="ts">
interface Field {
  key: string;
  label: string;
  type?: "textarea" | "date" | "number" | "image";
}
type Row = Record<string, any>;
type Table = "experience" | "projects";

const tables: Record<Table, { label: string; fields: Field[] }> = {
  experience: {
    label: "Experience",
    fields: [
      { key: "company", label: "Company" },
      { key: "company_url", label: "Company URL" },
      { key: "company_desc", label: "Company description" },
      { key: "position", label: "Position" },
      { key: "years", label: "Years" },
      { key: "list", label: "Responsibilities (HTML)", type: "textarea" },
    ],
  },
  projects: {
    label: "Projects",
    fields: [
      { key: "title", label: "Title" },
      { key: "url", label: "URL" },
      { key: "cats", label: "Categories (comma separated)" },
      { key: "posted_at", label: "Posted", type: "date" },
      { key: "thumbnail", label: "Thumbnail", type: "image" },
      { key: "cover", label: "Cover", type: "image" },
    ],
  },
};

const tab = ref<Table | "other">("experience");
const rows = ref<Row[]>([]);
const otherProjects = ref("");
const status = ref("");

useHead({ title: "Admin", meta: [{ name: "robots", content: "noindex" }] });

const fail = (e: any) => {
  status.value =
    e?.statusCode === 401 || e?.status === 401
      ? "Not authorized — open via Cloudflare Access"
      : e?.data?.statusMessage || e?.statusMessage || e?.message || "Error";
};

// API <-> form: YYYYMMDD <-> YYYY-MM-DD, string[] <-> "a, b"
const toForm = (r: Row): Row => ({
  ...r,
  ...(r.cats && { cats: r.cats.join(", ") }),
  ...(r.posted_at && {
    posted_at: String(r.posted_at).replace(/^(\d{4})(\d\d)(\d\d)$/, "$1-$2-$3"),
  }),
});
const toApi = (r: Row): Row => {
  const out = { ...r };
  if ("cats" in out)
    out.cats = String(out.cats)
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  if ("posted_at" in out)
    out.posted_at = String(out.posted_at ?? "").replaceAll("-", "");
  return out;
};

async function load() {
  status.value = "";
  try {
    if (tab.value === "other") {
      otherProjects.value = (await $fetch<{ other_projects: string }>("/api/admin/settings")).other_projects;
    } else {
      rows.value = (await $fetch<Row[]>(`/api/admin/${tab.value}`)).map(toForm);
    }
  } catch (e) {
    fail(e);
  }
}
onMounted(load);
watch(tab, load);

const table = computed(() => (tab.value === "other" ? null : tables[tab.value]));

const add = () => rows.value.push({ sort: rows.value.length + 1, cats: "" });

async function save(i: number) {
  try {
    const saved = await $fetch<Row>(`/api/admin/${tab.value}`, { method: "POST", body: toApi(rows.value[i]!) });
    rows.value[i] = toForm(saved);
    status.value = "Saved";
  } catch (e) {
    fail(e);
  }
}

async function remove(i: number) {
  const row = rows.value[i]!;
  if (!confirm("Delete this row?")) return;
  try {
    if (row.id) await $fetch(`/api/admin/${tab.value}`, { method: "DELETE", query: { id: row.id } });
    rows.value.splice(i, 1);
    status.value = "Deleted";
  } catch (e) {
    fail(e);
  }
}

// swap sort values with the neighbour and save both
async function move(i: number, d: -1 | 1) {
  const a = rows.value[i]!;
  const b = rows.value[i + d]!;
  [a.sort, b.sort] = [b.sort, a.sort];
  if (a.sort === b.sort) a.sort += d; // equal sorts can't be swapped; force order
  [rows.value[i], rows.value[i + d]] = [b, a];
  if (a.id) await save(rows.value.indexOf(a));
  if (b.id) await save(rows.value.indexOf(b));
}

async function upload(e: Event, row: Row, key: string) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const body = new FormData();
  body.append("file", file);
  try {
    row[key] = (await $fetch<{ url: string }>("/api/admin/upload", { method: "POST", body })).url;
    status.value = "Uploaded — remember to Save the row";
  } catch (err) {
    fail(err);
  }
}

async function saveOther() {
  try {
    await $fetch("/api/admin/settings", { method: "PUT", body: { other_projects: otherProjects.value } });
    status.value = "Saved";
  } catch (e) {
    fail(e);
  }
}
</script>

<template>
  <main class="admin">
    <h1>Admin</h1>
    <nav class="tabs" aria-label="Sections">
      <button
        v-for="(t, k) in tables"
        :key="k"
        type="button"
        :class="{ on: tab === k }"
        :aria-pressed="tab === k"
        @click="tab = k"
      >
        {{ t.label }}
      </button>
      <button type="button" :class="{ on: tab === 'other' }" :aria-pressed="tab === 'other'" @click="tab = 'other'">
        Other projects
      </button>
    </nav>
    <p class="status" role="status">{{ status }}</p>

    <form v-if="tab === 'other'" @submit.prevent="saveOther">
      <label>
        Other projects (HTML)
        <textarea v-model="otherProjects" rows="14" />
      </label>
      <button type="submit" class="primary">Save</button>
    </form>

    <template v-else-if="table">
      <form v-for="(row, i) in rows" :key="row.id ?? `new-${i}`" class="row" @submit.prevent="save(i)">
        <label class="sort">
          Sort
          <input v-model.number="row.sort" type="number" />
        </label>
        <label v-for="f in table.fields" :key="f.key" :class="{ wide: f.type === 'textarea' }">
          {{ f.label }}
          <textarea v-if="f.type === 'textarea'" v-model="row[f.key]" rows="6" />
          <template v-else-if="f.type === 'image'">
            <input v-model="row[f.key]" type="text" />
            <input type="file" accept="image/*" :aria-label="`${f.label} file`" @change="upload($event, row, f.key)" />
            <img v-if="row[f.key]" :src="row[f.key]" alt="" />
          </template>
          <input v-else v-model="row[f.key]" :type="f.type ?? 'text'" />
        </label>
        <div class="actions">
          <button type="submit" class="primary">Save</button>
          <button type="button" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)">↑</button>
          <button type="button" :disabled="i === rows.length - 1" aria-label="Move down" @click="move(i, 1)">↓</button>
          <button type="button" class="danger" @click="remove(i)">Delete</button>
        </div>
      </form>
      <button type="button" class="primary" @click="add">Add {{ table.label.toLowerCase() }}</button>
    </template>
  </main>
</template>

<style scoped lang="scss">
.admin {
  max-width: var(--row);
  margin: 0 auto;
  padding: 2em 1em 4em;
  font-family: var(--font2);
  color: var(--dark);
  background: var(--white);
  min-height: 100vh;
}
h1 {
  font-family: var(--font);
  margin: 0 0 0.5em;
}
.tabs {
  display: flex;
  gap: 0.5em;
  button.on {
    background: var(--dark);
    color: var(--white);
  }
}
.status {
  min-height: 1.5em;
  color: var(--bluelight);
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16em, 1fr));
  gap: 0.75em 1em;
  padding: 1em;
  margin-bottom: 1em;
  background: var(--light);
  border: 1px solid #d0d7de;
  border-radius: 6px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  font-size: 0.85em;
  font-weight: 600;
  &.wide {
    grid-column: 1 / -1;
  }
}
input,
textarea {
  font: inherit;
  font-weight: 400;
  padding: 0.4em 0.6em;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  background: var(--white);
}
textarea {
  font-family: var(--font);
  font-size: 0.9em;
}
img {
  max-width: 8em;
  max-height: 5em;
  object-fit: cover;
}
.actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5em;
}
button {
  font: inherit;
  padding: 0.4em 0.9em;
  border: 1px solid var(--dark);
  border-radius: 4px;
  background: var(--white);
  color: var(--dark);
  cursor: pointer;
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
  &.primary {
    background: var(--blue);
    border-color: var(--blue);
    color: var(--white);
  }
  &.danger {
    margin-left: auto;
    border-color: var(--red);
    color: var(--red);
  }
}
</style>
