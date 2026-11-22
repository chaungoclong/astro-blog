import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';
import { listMedia, normalizeOriginalMediaName, saveMedia } from '../../../lib/media';
import { dbService } from '../../../lib/db';
import { INVALID_FOLDER_MESSAGE, isValidMediaFolderPath } from '../../../lib/media-folders';

const UNAUTHORIZED_STATUS = 401;
const BAD_REQUEST_STATUS = 400;
const CREATED_STATUS = 201;
const ROOT_FOLDER = '';

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthenticated(cookies)) return Response.json({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }, { status: UNAUTHORIZED_STATUS });
  const metadata = new Map(dbService.getMediaMetadata().map((item) => [item.filename, item]));
  const media = (await listMedia()).map((item) => ({ ...item, folder: metadata.get(item.filename)?.folder || ROOT_FOLDER, originalName: metadata.get(item.filename)?.original_name || item.filename, references: dbService.getMediaReferences(item.url) }));
  const folders = [...new Set([...dbService.getMediaFolders(), ...media.map((item) => item.folder).filter(Boolean)])].sort();
  return Response.json({ success: true, media, folders });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return Response.json({ success: false, message: 'Yêu cầu đăng nhập quản trị.' }, { status: UNAUTHORIZED_STATUS });
  try {
    const form = await request.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') || ROOT_FOLDER).trim();
    if (!(file instanceof File)) return Response.json({ success: false, message: 'Vui lòng chọn một tệp ảnh.' }, { status: BAD_REQUEST_STATUS });
    if (!isValidMediaFolderPath(folder) || (folder && !dbService.getMediaFolders().includes(folder))) return Response.json({ success: false, message: INVALID_FOLDER_MESSAGE }, { status: BAD_REQUEST_STATUS });
    const item = await saveMedia(Buffer.from(await file.arrayBuffer()), file.type);
    const originalName = normalizeOriginalMediaName(file.name) || item.filename;
    dbService.upsertMediaMetadata(item.filename, folder, originalName);
    return Response.json({ success: true, media: { ...item, originalName } }, { status: CREATED_STATUS });
  } catch (error: any) {
    return Response.json({ success: false, message: error?.message || 'Không thể tải ảnh lên.' }, { status: BAD_REQUEST_STATUS });
  }
};
