const FOLDER_SEPARATOR = '/';
const ROOT_FOLDER = '';
const MAX_FOLDER_DEPTH = 8;
const MAX_FOLDER_PATH_LENGTH = 519;
const FOLDER_SEGMENT_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} _-]{0,63}$/u;

export const INVALID_FOLDER_MESSAGE = 'Tên thư mục chỉ gồm chữ, số, khoảng trắng, gạch nối hoặc gạch dưới.';

export function isValidMediaFolderPath(folder: string, allowRoot = true): boolean {
  if (folder === ROOT_FOLDER) return allowRoot;
  if (folder.length > MAX_FOLDER_PATH_LENGTH) return false;
  const segments = folder.split(FOLDER_SEPARATOR);
  return segments.length <= MAX_FOLDER_DEPTH && segments.every((segment) => FOLDER_SEGMENT_PATTERN.test(segment));
}

export function joinMediaFolderPath(parent: string, name: string): string | null {
  if (!isValidMediaFolderPath(parent) || !FOLDER_SEGMENT_PATTERN.test(name)) return null;
  const path = parent ? `${parent}${FOLDER_SEPARATOR}${name}` : name;
  return isValidMediaFolderPath(path, false) ? path : null;
}

export function isMediaFolderWithin(candidate: string, folder: string): boolean {
  return candidate === folder || candidate.startsWith(`${folder}${FOLDER_SEPARATOR}`);
}
