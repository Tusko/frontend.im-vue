export default defineEventHandler(async (event) => {
  const table = adminTable(event);
  const id = String(getQuery(event).id ?? "");
  if (!/^[1-9]\d*$/.test(id)) throw createError({ statusCode: 400, statusMessage: "id must be a positive integer" });
  await cfEnv(event).DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(Number(id)).run();
  return { ok: true };
});
