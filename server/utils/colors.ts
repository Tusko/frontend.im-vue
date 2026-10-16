// Language → color from GitHub Linguist (MIT), snapshot of github-colors 2.2.21 + SCSS.
// Vendored: that package re-downloads linguist master on every install and drags in js-yaml/argparse
import palette from "./colors.json";

export const langColor = (lang?: string | null) =>
  (lang && (palette as Record<string, string>)[lang.split(".")[0]!]) || "#1a1e22";
