import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';
import { dbService } from '../../../lib/db';
import { safeMediaFilename } from '../../../lib/media';
import { INVALID_FOLDER_MESSAGE, isValidMediaFolderPath } from '../../../lib/media-folders';

const UNAUTHORIZED_STATUS = 401;
const BAD_REQUEST_STATUS = 400;
const OK_STATUS = 200;

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return Response.json({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }, { status: UNAUTHORIZED_STATUS });
  const data = await request.json();
  const filename = safeMediaFilename(String(data.filename || ''));
  const folder = String(data.folder || '').trim();
  if (!filename || !isValidMediaFolderPath(folder) || (folder && !dbService.getMediaFolders().includes(folder))) return Response.json({ success: false, message: INVALID_FOLDER_MESSAGE }, { status: BAD_REQUEST_STATUS });
  if (!dbService.moveMediaMetadata(filename, folder)) dbService.upsertMediaMetadata(filename, folder);
  return Response.json({ success: true }, { status: OK_STATUS });
};
