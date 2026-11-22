import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
export const MEDIA_DIR = path.resolve(process.cwd(), 'data', 'uploads');
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_MEDIA_SIZE = 20 * 1024 * 1024;
export const MEDIA_URL_PREFIX = '/uploads/';
export const MEDIA_FILENAME_BYTES = 12;
export const MEDIA_CACHE_CONTROL = 'public, max-age=31536000, immutable';
export const MEDIA_NOT_FOUND_TEXT = 'Not found';
const LOCAL_DRIVER = 'local';
const JPEG_TYPE = 'image/jpeg';
const PNG_TYPE = 'image/png';
const WEBP_TYPE = 'image/webp';
const GIF_TYPE = 'image/gif';
const PDF_TYPE = 'application/pdf';
const ZIP_TYPE = 'application/zip';
const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PPTX_TYPE = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const JPG_EXTENSION = 'jpg';
const WEBP_MARKER = 'WEBP';
const WEBP_MARKER_START = 8;
const WEBP_MARKER_END = 12;
const HEX_ENCODING = 'hex';
const FILE_WRITE_MODE = 'wx';
const MISSING_FILE_CODE = 'ENOENT';
const MAX_ORIGINAL_FILENAME_LENGTH = 255;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/g;
const MEDIA_FILENAME_PATTERN = /^[a-f0-9]{24}\.(jpg|png|webp|gif|pdf|zip|docx|xlsx|pptx)$/;
const INVALID_MEDIA_ERROR =
  'Tệp không hợp lệ. Ảnh tối đa 5 MB; PDF, ZIP và tài liệu Office tối đa 20 MB.';
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const TYPES: Record<
  string,
  { extension: string; mime: string; signature: number[]; maxSize: number }
> = {
  [JPEG_TYPE]: {
    extension: JPG_EXTENSION,
    mime: JPEG_TYPE,
    signature: [0xff, 0xd8, 0xff],
    maxSize: MAX_IMAGE_SIZE,
  },
  [PNG_TYPE]: {
    extension: 'png',
    mime: PNG_TYPE,
    signature: [0x89, 0x50, 0x4e, 0x47],
    maxSize: MAX_IMAGE_SIZE,
  },
  [WEBP_TYPE]: {
    extension: 'webp',
    mime: WEBP_TYPE,
    signature: [0x52, 0x49, 0x46, 0x46],
    maxSize: MAX_IMAGE_SIZE,
  },
  [GIF_TYPE]: {
    extension: 'gif',
    mime: GIF_TYPE,
    signature: [0x47, 0x49, 0x46, 0x38],
    maxSize: MAX_IMAGE_SIZE,
  },
  [PDF_TYPE]: {
    extension: 'pdf',
    mime: PDF_TYPE,
    signature: [0x25, 0x50, 0x44, 0x46],
    maxSize: MAX_MEDIA_SIZE,
  },
  [ZIP_TYPE]: {
    extension: 'zip',
    mime: ZIP_TYPE,
    signature: ZIP_SIGNATURE,
    maxSize: MAX_MEDIA_SIZE,
  },
  [DOCX_TYPE]: {
    extension: 'docx',
    mime: DOCX_TYPE,
    signature: ZIP_SIGNATURE,
    maxSize: MAX_MEDIA_SIZE,
  },
  [XLSX_TYPE]: {
    extension: 'xlsx',
    mime: XLSX_TYPE,
    signature: ZIP_SIGNATURE,
    maxSize: MAX_MEDIA_SIZE,
  },
  [PPTX_TYPE]: {
    extension: 'pptx',
    mime: PPTX_TYPE,
    signature: ZIP_SIGNATURE,
    maxSize: MAX_MEDIA_SIZE,
  },
};
const EXTENSION_TYPES = Object.fromEntries(
  Object.values(TYPES).map((item) => [item.extension, item.mime])
);
export interface MediaItem {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  type: string;
}
export interface MediaStorage {
  list(): Promise<MediaItem[]>;
  save(buffer: Buffer, type: string): Promise<MediaItem>;
  delete(filename: string): Promise<boolean>;
  read?(filename: string): Promise<{ buffer: Buffer; type: string } | null>;
}
export async function ensureMediaDir() {
  await fs.mkdir(MEDIA_DIR, { recursive: true });
}
export function validateMediaBuffer(
  buffer: Buffer,
  type: string
): { extension: string; mime: string } | null {
  const allowed = TYPES[type];
  if (
    !allowed ||
    !buffer.length ||
    buffer.length > allowed.maxSize ||
    !allowed.signature.every((byte, index) => buffer[index] === byte)
  )
    return null;
  if (
    type === WEBP_TYPE &&
    buffer.subarray(WEBP_MARKER_START, WEBP_MARKER_END).toString() !== WEBP_MARKER
  )
    return null;
  return { extension: allowed.extension, mime: allowed.mime };
}
export function safeMediaFilename(filename: string | undefined): string | null {
  return filename && MEDIA_FILENAME_PATTERN.test(filename) ? filename : null;
}
export function normalizeOriginalMediaName(filename: string): string {
  const leaf = filename.replaceAll('\\', '/').split('/').at(-1) || '';
  return leaf.replace(CONTROL_CHARACTER_PATTERN, '').trim().slice(0, MAX_ORIGINAL_FILENAME_LENGTH);
}
function typeForExtension(extension: string): string {
  return EXTENSION_TYPES[extension] || 'application/octet-stream';
}
export function isImageMediaType(type: string): boolean {
  return type.startsWith('image/');
}
function itemUrl(filename: string): string {
  return MEDIA_URL_PREFIX + filename;
}
async function listLocalMedia(): Promise<MediaItem[]> {
  await ensureMediaDir();
  const entries = await fs.readdir(MEDIA_DIR, { withFileTypes: true });
  const items = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const filename = safeMediaFilename(entry.name);
        if (!filename) return null;
        const stat = await fs.stat(path.join(MEDIA_DIR, filename));
        return {
          filename,
          url: itemUrl(filename),
          size: stat.size,
          createdAt: stat.birthtime.toISOString(),
          type: typeForExtension(path.extname(filename).slice(1)),
        };
      })
  );
  return items
    .filter(Boolean)
    .sort((a, b) => b!.createdAt.localeCompare(a!.createdAt)) as MediaItem[];
}
async function saveLocalMedia(buffer: Buffer, type: string): Promise<MediaItem> {
  const valid = validateMediaBuffer(buffer, type);
  if (!valid) throw new Error(INVALID_MEDIA_ERROR);
  await ensureMediaDir();
  const filename =
    crypto.randomBytes(MEDIA_FILENAME_BYTES).toString(HEX_ENCODING) + '.' + valid.extension;
  await fs.writeFile(path.join(MEDIA_DIR, filename), buffer, { flag: FILE_WRITE_MODE });
  return {
    filename,
    url: itemUrl(filename),
    size: buffer.length,
    createdAt: new Date().toISOString(),
    type: valid.mime,
  };
}
async function deleteLocalMedia(filename: string): Promise<boolean> {
  const safe = safeMediaFilename(filename);
  if (!safe) return false;
  try {
    await fs.unlink(path.join(MEDIA_DIR, safe));
    return true;
  } catch (error: any) {
    if (error?.code === MISSING_FILE_CODE) return false;
    throw error;
  }
}
async function readLocalMedia(filename: string): Promise<{ buffer: Buffer; type: string } | null> {
  const safe = safeMediaFilename(filename);
  if (!safe) return null;
  try {
    const buffer = await fs.readFile(path.join(MEDIA_DIR, safe));
    return { buffer, type: typeForExtension(path.extname(safe).slice(1)) };
  } catch {
    return null;
  }
}
export class LocalMediaStorage implements MediaStorage {
  list = listLocalMedia;
  save = saveLocalMedia;
  delete = deleteLocalMedia;
  read = readLocalMedia;
}
export function createMediaStorage(
  driver = process.env.MEDIA_STORAGE_DRIVER || LOCAL_DRIVER
): MediaStorage {
  if (driver === LOCAL_DRIVER) return new LocalMediaStorage();
  throw new Error(
    'MEDIA_STORAGE_DRIVER=' +
      driver +
      ' is not configured. Register an S3/R2 MediaStorage provider for this deployment.'
  );
}
export const mediaStorage = createMediaStorage();
export const listMedia = () => mediaStorage.list();
export const saveMedia = (buffer: Buffer, type: string) => mediaStorage.save(buffer, type);
export const deleteMedia = (filename: string) => mediaStorage.delete(filename);
export const readMedia = (filename: string) =>
  mediaStorage.read ? mediaStorage.read(filename) : Promise.resolve(null);
