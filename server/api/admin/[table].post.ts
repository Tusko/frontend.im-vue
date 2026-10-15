const bad = (statusMessage: string) => createError({ statusCode: 400, statusMessage });
// Rendered as href/src on public pages: no javascript: or other schemes
const URL_COLS = ["url", "company_url", "thumbnail", "cover"];

export default defineEventHandler(async (event) => {
  const table = adminTable(event);
  const body = await readBody(event);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw bad("Body must be an object");

  const cols: string[] = [];
  const values: (string | number)[] = [];
  for (const col of adminTables[table]) {
    if (!(col in body)) continue;
    const v = body[col];
    cols.push(col);
    if (col === "sort") {
      if (!Number.isInteger(Number(v))) throw bad("sort must be an integer");
      values.push(Number(v));
    } else if (col === "cats") {
      if (!Array.isArray(v) || v.some((c) => typeof c !== "string")) throw bad("cats must be string[]");
      values.push(JSON.stringify(v.map((c: string) => c.trim()).filter(Boolean)));
    } else {
      const s = String(v ?? "").trim();
      if (URL_COLS.includes(col) && !/^(https?:\/\/|\/media\/|$)/i.test(s)) throw bad(`${col} must be an http(s) or /media/ URL`);
      if (col === "posted_at" && !/^(\d{8})?$/.test(s)) throw bad("posted_at must be YYYYMMDD");
      values.push(s);
    }
  }

  const db = cfEnv(event).DB;
  const returning = `RETURNING id, ${adminTables[table].join(", ")}`;
  let row: Record<string, unknown> | null;
  if (body.id == null) {
    row = await db
      .prepare(
        cols.length
          ? `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")}) ${returning}`
          : `INSERT INTO ${table} DEFAULT VALUES ${returning}`
      )
      .bind(...values)
      .first();
  } else {
    const id = Number(body.id);
    if (!Number.isInteger(id) || id < 1) throw bad("id must be a positive integer");
    if (!cols.length) throw bad("Nothing to update");
    row = await db
      .prepare(`UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ? ${returning}`)
      .bind(...values, id)
      .first();
    if (!row) throw createError({ statusCode: 404, statusMessage: "Row not found" });
  }
  return parseRow(row!);
});
