// No SVG: it can carry script and would be served from our origin
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX = 5 * 1024 * 1024;

export default defineEventHandler(async (event) => {
  if (Number(getHeader(event, "content-length")) > MAX + 1024)
    throw createError({ statusCode: 413, statusMessage: "File exceeds 5MB" });
  const file = (await readMultipartFormData(event))?.find((f) => f.name === "file");
  const ext = file?.type && EXT[file.type];
  if (!file || !ext) throw createError({ statusCode: 400, statusMessage: "file must be a png, jpeg, webp, gif or avif image" });
  if (file.data.length > MAX) throw createError({ statusCode: 413, statusMessage: "File exceeds 5MB" });

  const key = `${crypto.randomUUID()}.${ext}`;
  await cfEnv(event).MEDIA.put(key, file.data, { httpMetadata: { contentType: file.type } });
  return { url: `/media/${key}` };
});
