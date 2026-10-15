interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  updated_at: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
}

export default defineCachedEventHandler(
  async (event) => {
    const { githubUser, githubToken } = useRuntimeConfig(event);
    const gh = $fetch.create({
      baseURL: "https://api.github.com",
      headers: {
        "User-Agent": "frontend.im",
        ...(githubToken && { Authorization: `Bearer ${githubToken}` }),
      },
    });

    const [user, repos] = await Promise.all([
      gh<Record<string, string>>(`/users/${githubUser}`),
      gh<Repo[]>(`/users/${githubUser}/repos`, { query: { per_page: 100 } }),
    ]);

    return {
      user: {
        name: user.name,
        bio: user.bio,
        email: user.email,
        location: user.location,
        avatar_url: user.avatar_url,
      },
      repos: repos
        .filter(
          (r) =>
            !r.private &&
            !r.fork &&
            !r.archived &&
            !r.name.includes("frontend.im") &&
            r.name !== "Tusko"
        )
        .sort(
          (a, b) =>
            b.stargazers_count - a.stargazers_count ||
            b.forks_count - a.forks_count ||
            Date.parse(b.updated_at) - Date.parse(a.updated_at)
        )
        .slice(0, 8)
        .map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          url: r.html_url,
          language: r.language,
          color: langColor(r.language),
          stars: r.stargazers_count,
          forks: r.forks_count,
          watchers: r.watchers_count,
        })),
    };
  },
  { name: "github", maxAge: 60 * 60 * 24, getKey: () => "v1" }
);
