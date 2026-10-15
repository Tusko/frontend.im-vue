// Same key everywhere → one request per page, shared via payload
export const useGithub = () => useFetch("/api/github", { key: "github" });
export const useContent = () => useFetch("/api/content", { key: "content" });
