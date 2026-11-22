import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';
import { deleteMedia, MEDIA_URL_PREFIX } from '../../../lib/media';
import { dbService } from '../../../lib/db';

const UNAUTHORIZED_STATUS = 401;
const NOT_FOUND_STATUS = 404;
const OK_STATUS = 200;
const BAD_REQUEST_STATUS = 400;

export const DELETE: APIRoute = async ({ params, cookies, request }) => {
  if (!isAuthenticated(cookies)) return Response.json({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }, { status: UNAUTHORIZED_STATUS });
  const filename = params.filename || '';
  const url = MEDIA_URL_PREFIX + filename;
  const references = dbService.getMediaReferences(url);
  const force = new URL(request.url).searchParams.get('force') === 'true';
  if (references.length && !force) return Response.json({ success: false, needsConfirmation: true, references }, { status: BAD_REQUEST_STATUS });
  const deleted = await deleteMedia(filename);
  if (deleted) dbService.deleteMediaMetadata(filename);
  return Response.json({ success: deleted }, { status: deleted ? OK_STATUS : NOT_FOUND_STATUS });
};
