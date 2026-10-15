import type { H3Event } from "h3";
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

export const cfEnv = (event: H3Event) =>
  event.context.cloudflare.env as { DB: D1Database; MEDIA: R2Bucket };
