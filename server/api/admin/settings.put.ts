// Saves whichever settings the body carries: other_projects (HTML string) and/or seo (object)
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const updates: [string, string][] = [];

  if (body?.other_projects !== undefined) {
    if (typeof body.other_projects !== "string")
      throw createError({ statusCode: 400, statusMessage: "other_projects must be a string" });
    updates.push(["other_projects", body.other_projects]);
  }
  if (body?.seo !== undefined) {
    // A null or malformed body would otherwise parse to empty settings and wipe the saved ones
    if (!body.seo || typeof body.seo !== "object" || Array.isArray(body.seo))
      throw createError({ statusCode: 400, statusMessage: "seo must be an object" });
    if (body.seo.jsonld && JSON.stringify(body.seo.jsonld).length > 32 * 1024)
      throw createError({ statusCode: 413, statusMessage: "JSON-LD exceeds 32 KB" });
    updates.push(["seo", JSON.stringify(parseSeo(body.seo))]);
  }
  if (!updates.length) throw createError({ statusCode: 400, statusMessage: "Nothing to save" });

  const db = cfEnv(event).DB;
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  await db.batch(updates.map(([k, v]) => upsert.bind(k, v)));
  return Object.fromEntries(updates.map(([k, v]) => [k, k === "seo" ? JSON.parse(v) : v]));
});
