export default defineEventHandler(async (event) => {
  const table = adminTable(event);
  const { results } = await cfEnv(event)
    .DB.prepare(`SELECT id, ${adminTables[table].join(", ")} FROM ${table} ORDER BY sort, id`)
    .all<Record<string, unknown>>();
  return results.map(parseRow);
});
