export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (typeof body?.other_projects !== "string")
    throw createError({ statusCode: 400, statusMessage: "other_projects must be a string" });

  await cfEnv(event)
    .DB.prepare(
      "INSERT INTO settings (key, value) VALUES ('other_projects', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .bind(body.other_projects)
    .run();
  return { other_projects: body.other_projects };
});
