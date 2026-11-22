import type { Context } from 'hono';
import {
  deleteMedia,
  listMedia,
  MEDIA_URL_PREFIX,
  normalizeOriginalMediaName,
  safeMediaFilename,
  saveMedia,
} from './media-storage.repository.ts';
import {
  INVALID_FOLDER_MESSAGE,
  isMediaFolderWithin,
  isValidMediaFolderPath,
  joinMediaFolderPath,
} from './media-folder.service.ts';
import { mediaService } from '../../index.ts';
import { HTTP_STATUS } from '../../shared/constant.ts';
import type { ApiEnv } from '../../shared/middleware/auth.middleware.ts';
import { MEDIA_CONSTANTS } from './constant.ts';

export async function listMediaHandler(c: Context<ApiEnv>) {
  const metadata = new Map(
    (await mediaService.getMediaMetadata()).map((item) => [item.filename, item])
  );
  const media = await Promise.all(
    (await listMedia()).map(async (item) => ({
      ...item,
      folder: metadata.get(item.filename)?.folder || MEDIA_CONSTANTS.ROOT_FOLDER,
      originalName: metadata.get(item.filename)?.original_name || item.filename,
      references: await mediaService.getMediaReferences(item.url),
    }))
  );
  const folders = [
    ...new Set([
      ...(await mediaService.getMediaFolders()),
      ...media.map((item) => item.folder).filter(Boolean),
    ]),
  ].sort();

  return c.json({ success: true, media, folders }, HTTP_STATUS.OK);
}

export async function uploadMediaHandler(c: Context<ApiEnv>) {
  try {
    const form = await c.req.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') || MEDIA_CONSTANTS.ROOT_FOLDER).trim();
    if (!(file instanceof File)) {
      return c.json(
        { success: false, message: MEDIA_CONSTANTS.FILE_REQUIRED_MESSAGE },
        HTTP_STATUS.BAD_REQUEST
      );
    }
    if (
      !isValidMediaFolderPath(folder) ||
      (folder && !(await mediaService.getMediaFolders()).includes(folder))
    ) {
      return c.json({ success: false, message: INVALID_FOLDER_MESSAGE }, HTTP_STATUS.BAD_REQUEST);
    }

    const item = await saveMedia(Buffer.from(await file.arrayBuffer()), file.type);
    const originalName = normalizeOriginalMediaName(file.name) || item.filename;
    await mediaService.upsertMediaMetadata(item.filename, folder, originalName);
    return c.json({ success: true, media: { ...item, originalName } }, HTTP_STATUS.CREATED);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : MEDIA_CONSTANTS.UPLOAD_ERROR_MESSAGE;
    return c.json({ success: false, message }, HTTP_STATUS.BAD_REQUEST);
  }
}

export async function moveMediaHandler(c: Context<ApiEnv>) {
  const data = await c.req.json();
  const filename = safeMediaFilename(String(data.filename || ''));
  const folder = String(data.folder || MEDIA_CONSTANTS.ROOT_FOLDER).trim();
  if (
    !filename ||
    !isValidMediaFolderPath(folder) ||
    (folder && !(await mediaService.getMediaFolders()).includes(folder))
  ) {
    return c.json({ success: false, message: INVALID_FOLDER_MESSAGE }, HTTP_STATUS.BAD_REQUEST);
  }

  if (!(await mediaService.moveMediaMetadata(filename, folder))) {
    await mediaService.upsertMediaMetadata(filename, folder);
  }
  return c.json({ success: true }, HTTP_STATUS.OK);
}

export async function createMediaFolderHandler(c: Context<ApiEnv>) {
  const data = await c.req.json();
  const name = String(data.name || '').trim();
  const parent = String(data.parent || MEDIA_CONSTANTS.ROOT_FOLDER).trim();
  if (!isValidMediaFolderPath(parent)) {
    return c.json({ success: false, message: INVALID_FOLDER_MESSAGE }, HTTP_STATUS.BAD_REQUEST);
  }
  if (parent && !(await mediaService.getMediaFolders()).includes(parent)) {
    return c.json(
      { success: false, message: MEDIA_CONSTANTS.MISSING_PARENT_MESSAGE },
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const folder = joinMediaFolderPath(parent, name);
  if (!folder) {
    return c.json({ success: false, message: INVALID_FOLDER_MESSAGE }, HTTP_STATUS.BAD_REQUEST);
  }

  const created = await mediaService.createMediaFolder(folder);
  return c.json(
    {
      success: created,
      folder,
      message: created
        ? MEDIA_CONSTANTS.FOLDER_CREATED_MESSAGE
        : MEDIA_CONSTANTS.FOLDER_EXISTS_MESSAGE,
    },
    created ? HTTP_STATUS.CREATED : HTTP_STATUS.CONFLICT
  );
}

export async function deleteMediaFolderHandler(c: Context<ApiEnv>) {
  const data = await c.req.json();
  const folder = String(data.folder || MEDIA_CONSTANTS.ROOT_FOLDER).trim();
  const preview = data.preview === true;
  const force = data.force === true;
  const allFolders = await mediaService.getMediaFolders();

  if (!isValidMediaFolderPath(folder, false)) {
    return c.json({ success: false, message: INVALID_FOLDER_MESSAGE }, HTTP_STATUS.BAD_REQUEST);
  }
  if (!allFolders.includes(folder)) {
    return c.json(
      { success: false, message: MEDIA_CONSTANTS.FOLDER_NOT_FOUND_MESSAGE },
      HTTP_STATUS.NOT_FOUND
    );
  }

  const folders = allFolders.filter((candidate) => isMediaFolderWithin(candidate, folder));
  const media = (await mediaService.getMediaMetadata()).filter((item) =>
    isMediaFolderWithin(item.folder, folder)
  );
  const files = await Promise.all(
    media.map(async (item) => ({
      filename: item.filename,
      references: await mediaService.getMediaReferences(MEDIA_URL_PREFIX + item.filename),
    }))
  );
  const references = files.flatMap((item) =>
    item.references.map((reference) => ({ ...reference, filename: item.filename }))
  );

  if (preview) {
    return c.json(
      { success: true, preview: true, folder, folders, files, references },
      HTTP_STATUS.OK
    );
  }
  if (references.length && !force) {
    return c.json(
      { success: false, needsConfirmation: true, folder, folders, files, references },
      HTTP_STATUS.CONFLICT
    );
  }

  const failedFiles: string[] = [];
  for (const item of media) {
    const deleted = await deleteMedia(item.filename);
    if (deleted) {
      await mediaService.deleteMediaMetadata(item.filename);
    } else {
      failedFiles.push(item.filename);
    }
  }
  if (failedFiles.length) {
    return c.json(
      { success: false, message: MEDIA_CONSTANTS.DELETE_FAILED_MESSAGE, failedFiles },
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  for (const name of folders.sort((left, right) => right.length - left.length)) {
    await mediaService.deleteMediaFolder(name);
  }

  return c.json(
    { success: true, deletedFiles: media.length, deletedFolders: folders.length },
    HTTP_STATUS.OK
  );
}

export async function deleteMediaHandler(c: Context<ApiEnv>) {
  const filename = c.req.param('filename') || '';
  const url = MEDIA_URL_PREFIX + filename;
  const references = await mediaService.getMediaReferences(url);
  const force = c.req.query(MEDIA_CONSTANTS.FORCE_QUERY_PARAM) === MEDIA_CONSTANTS.TRUE_STRING;
  if (references.length && !force) {
    return c.json({ success: false, needsConfirmation: true, references }, HTTP_STATUS.BAD_REQUEST);
  }

  const deleted = await deleteMedia(filename);
  if (deleted) {
    await mediaService.deleteMediaMetadata(filename);
  }
  return c.json({ success: deleted }, deleted ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND);
}
