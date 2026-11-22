import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';
import { dbService } from '../../../lib/db';
import { deleteMedia, MEDIA_URL_PREFIX } from '../../../lib/media';
import { INVALID_FOLDER_MESSAGE, isMediaFolderWithin, isValidMediaFolderPath, joinMediaFolderPath } from '../../../lib/media-folders';

const UNAUTHORIZED_STATUS = 401;
const BAD_REQUEST_STATUS = 400;
const CREATED_STATUS = 201;
const CONFLICT_STATUS = 409;
const MISSING_PARENT_MESSAGE = 'Thư mục cha không tồn tại.';
const NOT_FOUND_STATUS = 404;
const OK_STATUS = 200;
const DELETE_FAILED_STATUS = 500;
const FOLDER_NOT_FOUND_MESSAGE = 'Thư mục không tồn tại.';
const DELETE_FAILED_MESSAGE = 'Không thể xóa toàn bộ ảnh trong thư mục.';

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return Response.json({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }, { status: UNAUTHORIZED_STATUS });
  const data = await request.json();
  const name = String(data.name || '').trim();
  const parent = String(data.parent || '').trim();
  if (!isValidMediaFolderPath(parent)) return Response.json({ success: false, message: INVALID_FOLDER_MESSAGE }, { status: BAD_REQUEST_STATUS });
  if (parent && !dbService.getMediaFolders().includes(parent)) return Response.json({ success: false, message: MISSING_PARENT_MESSAGE }, { status: BAD_REQUEST_STATUS });
  const folder = joinMediaFolderPath(parent, name);
  if (!folder) return Response.json({ success: false, message: INVALID_FOLDER_MESSAGE }, { status: BAD_REQUEST_STATUS });
  const created = dbService.createMediaFolder(folder);
  return Response.json({ success: created, folder, message: created ? 'Đã tạo thư mục.' : 'Thư mục đã tồn tại.' }, { status: created ? CREATED_STATUS : CONFLICT_STATUS });
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return Response.json({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }, { status: UNAUTHORIZED_STATUS });
  const data = await request.json();
  const folder = String(data.folder || '').trim();
  const preview = data.preview === true;
  const force = data.force === true;
  const allFolders = dbService.getMediaFolders();
  if (!isValidMediaFolderPath(folder, false)) return Response.json({ success: false, message: INVALID_FOLDER_MESSAGE }, { status: BAD_REQUEST_STATUS });
  if (!allFolders.includes(folder)) return Response.json({ success: false, message: FOLDER_NOT_FOUND_MESSAGE }, { status: NOT_FOUND_STATUS });

  const folders = allFolders.filter((candidate) => isMediaFolderWithin(candidate, folder));
  const media = dbService.getMediaMetadata().filter((item) => isMediaFolderWithin(item.folder, folder));
  const files = media.map((item) => ({
    filename: item.filename,
    references: dbService.getMediaReferences(MEDIA_URL_PREFIX + item.filename),
  }));
  const references = files.flatMap((item) => item.references.map((reference) => ({ ...reference, filename: item.filename })));
  if (preview) return Response.json({ success: true, preview: true, folder, folders, files, references }, { status: OK_STATUS });
  if (references.length && !force) return Response.json({ success: false, needsConfirmation: true, folder, folders, files, references }, { status: CONFLICT_STATUS });

  const failedFiles: string[] = [];
  for (const item of media) {
    const deleted = await deleteMedia(item.filename);
    if (deleted) dbService.deleteMediaMetadata(item.filename); else failedFiles.push(item.filename);
  }
  if (failedFiles.length) return Response.json({ success: false, message: DELETE_FAILED_MESSAGE, failedFiles }, { status: DELETE_FAILED_STATUS });
  folders.sort((left, right) => right.length - left.length).forEach((name) => dbService.deleteMediaFolder(name));
  return Response.json({ success: true, deletedFiles: media.length, deletedFolders: folders.length }, { status: OK_STATUS });
};
