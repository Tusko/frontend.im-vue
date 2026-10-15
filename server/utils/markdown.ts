import type { H3Event } from "h3";

const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', nbsp: " ", "#39": "'" };

// Just enough HTML → Markdown for the CMS fields (lists, links, headings, paragraphs)
export const htmlToMd = (html: string) =>
  html
    .replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<h\d[^>]*>([\s\S]*?)<\/h\d>/gi, "\n### $1\n")
    .replace(/\s*<li[^>]*>\s*/gi, "\n- ")
    .replace(/<\/(p|ul|ol)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ") // divs/spans from pasted HTML must not break a list item
    .replace(/&(#?\w+);/g, (m, e) => entities[e] ?? (e[0] === "#" ? String.fromCodePoint(+e.slice(1)) : m))
    .replace(/[ \t]+/g, " ")
    .replace(/^ +| +$/gm, "")
    .replace(/^-\n+(?=\S)/gm, "- ") // join a bullet to text that a <div> pushed onto the next line
    .replace(/^-$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// The home page as Markdown, for agents that send Accept: text/markdown (and /llms.txt)
export async function siteMarkdown(event: H3Event) {
  const [{ user }, content] = await Promise.all([event.$fetch("/api/github"), event.$fetch("/api/content")]);
  const origin = getRequestURL(event).origin;

  return [
    `# ${user.name}`,
    htmlToMd(user.bio ?? "").split("\n").map((l) => `> ${l}`).join("\n"),
    [user.location && `Location: ${user.location}`, user.email && `Email: ${user.email}`, `GitHub: https://github.com/tusko`, `CV: ${origin}/cv`]
      .filter(Boolean)
      .map((l) => `- ${l}`)
      .join("\n"),
    "## Experience",
    ...content.experience.map((e) =>
      [
        `### ${e.position} at [${e.company}](${e.company_url})`,
        [e.years, e.company_desc].filter(Boolean).join(", "),
        htmlToMd(e.list),
      ].join("\n\n")
    ),
    "## Projects",
    content.projects
      .map((p) => `- [${htmlToMd(p.title).replace(/\n+/g, " – ")}](${p.url}) (${p.postedAt.slice(0, 4)}): ${p.cats.join(", ")}`)
      .join("\n"),
    htmlToMd(content.otherProjects),
  ].join("\n\n") + "\n";
}
