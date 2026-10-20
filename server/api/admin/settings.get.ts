export default defineEventHandler(async (event) => {
  const db = cfEnv(event).DB;
  const [otherProjects, seo] = await Promise.all([
    db.prepare("SELECT value FROM settings WHERE key = 'other_projects'").first<string>("value"),
    readSeo(db),
  ]);
  return { other_projects: otherProjects ?? "", seo };
});
