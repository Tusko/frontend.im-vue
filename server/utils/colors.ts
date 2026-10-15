import colors from "github-colors/lib/colors.json";

const palette: Record<string, { color?: string }> = { ...colors, SCSS: { color: "#CF649A" } } as never;

export const langColor = (lang?: string | null) =>
  (lang && palette[lang.split(".")[0]!]?.color) || "#1a1e22";
