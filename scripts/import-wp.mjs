// One-off WordPress → D1 seed. Usage:
//   node scripts/import-wp.mjs > /tmp/seed.sql && npx wrangler d1 execute DB --local --file /tmp/seed.sql
const WP = process.env.WP_API || "https://api.frontend.im";

const get = (path) =>
  fetch(WP + path).then((r) => {
    if (!r.ok) throw new Error(`${r.status} ${path}`);
    return r.json();
  });

const q = (v) => (v == null ? "''" : `'${String(v).replaceAll("'", "''")}'`);
const row = (table, obj) =>
  `INSERT INTO ${table} (${Object.keys(obj).join(", ")}) VALUES (${Object.values(obj)
    .map((v) => (typeof v === "number" ? v : q(v)))
    .join(", ")});`;

const [options, posts] = await Promise.all([
  get("/wp-json/acf/v3/options/options"),
  get("/wp-json/wp/v2/posts?_minimal&per_page=100"),
]);

const out = ["DELETE FROM experience;", "DELETE FROM projects;", "DELETE FROM settings;"];
(options.acf.experience ?? []).forEach((e, i) =>
  out.push(
    row("experience", {
      sort: i,
      company: e.company,
      company_url: e.company_url,
      company_desc: e.company_desc,
      position: e.position,
      years: e.years,
      list: e.list,
    })
  )
);
posts.forEach((p, i) =>
  out.push(
    row("projects", {
      id: p.id,
      sort: i,
      title: p.title.rendered,
      url: p.acf.site_url,
      cats: JSON.stringify(p.cats ?? []),
      posted_at: p.acf.posted_at,
      thumbnail: p.thumbnail[0],
      cover: p.cover[0],
      soon: p.acf.soon ? 1 : 0,
    })
  )
);
out.push(row("settings", { key: "other_projects", value: options.acf.other_projects ?? "" }));

console.log(out.join("\n"));
