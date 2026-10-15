import type { H3Event } from "h3";

// Writable columns per admin table; the table name is only ever taken from these keys
export const adminTables = {
  experience: ["sort", "company", "company_url", "company_desc", "position", "years", "list"],
  projects: ["sort", "title", "url", "cats", "posted_at", "thumbnail", "cover"],
} as const;

export const adminTable = (event: H3Event) => {
  const table = getRouterParam(event, "table");
  if (!table || !Object.hasOwn(adminTables, table))
    throw createError({ statusCode: 404, statusMessage: "Unknown table" });
  return table as keyof typeof adminTables;
};

export const parseRow = (row: Record<string, unknown>) =>
  typeof row.cats === "string" ? { ...row, cats: JSON.parse(row.cats) as string[] } : row;
