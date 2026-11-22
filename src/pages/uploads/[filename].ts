import type { APIRoute } from 'astro';
import { isImageMediaType, MEDIA_CACHE_CONTROL, MEDIA_NOT_FOUND_TEXT, readMedia } from '../../lib/media';

const NOT_FOUND_STATUS = 404;
const CONTENT_TYPE_HEADER = 'Content-Type';
const CACHE_CONTROL_HEADER = 'Cache-Control';
const NOSNIFF_HEADER = 'X-Content-Type-Options';
const NOSNIFF_VALUE = 'nosniff';
const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';
const ATTACHMENT_VALUE = 'attachment';

export const GET: APIRoute = async ({ params }) => {
  const item = await readMedia(params.filename || '');
  if (!item) return new Response(MEDIA_NOT_FOUND_TEXT, { status: NOT_FOUND_STATUS });
  const headers: Record<string, string> = { [CONTENT_TYPE_HEADER]: item.type, [CACHE_CONTROL_HEADER]: MEDIA_CACHE_CONTROL, [NOSNIFF_HEADER]: NOSNIFF_VALUE };
  if (!isImageMediaType(item.type)) headers[CONTENT_DISPOSITION_HEADER] = ATTACHMENT_VALUE;
  return new Response(item.buffer, { headers });
};
