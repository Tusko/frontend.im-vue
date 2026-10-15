export default defineEventHandler(async (event) => {
  const value = await cfEnv(event)
    .DB.prepare("SELECT value FROM settings WHERE key = 'other_projects'")
    .first<string>("value");
  return { other_projects: value ?? "" };
});
