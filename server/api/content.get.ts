interface Experience {
  company: string;
  company_url: string;
  company_desc: string;
  position: string;
  years: string;
  list: string;
}
interface Project {
  id: number;
  title: string;
  url: string;
  cats: string; // JSON string[]
  postedAt: string; // YYYYMMDD
  thumbnail: string;
  cover: string;
}

// Public site content, edited via /admin. Uncached: D1 reads are cheap and edits show up immediately
export default defineEventHandler(async (event) => {
  const db = cfEnv(event).DB;
  const [experience, projects, otherProjects] = await Promise.all([
    db
      .prepare(
        "SELECT company, company_url, company_desc, position, years, list FROM experience ORDER BY sort, id"
      )
      .all<Experience>(),
    db
      .prepare(
        // "Soon" projects are listed without a link
        "SELECT id, title, IIF(soon, '', url) AS url, cats, posted_at AS postedAt, thumbnail, cover FROM projects ORDER BY sort, id"
      )
      .all<Project>(),
    db.prepare("SELECT value FROM settings WHERE key = 'other_projects'").first<string>("value"),
  ]);

  return {
    experience: experience.results,
    otherProjects: otherProjects ?? "",
    projects: projects.results.map((p) => ({ ...p, cats: JSON.parse(p.cats) as string[] })),
  };
});
