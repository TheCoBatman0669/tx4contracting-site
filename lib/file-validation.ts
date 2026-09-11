/**
 * Attachment rules.
 *
 * These limits are enforced again server-side in Phase 5. Client-side checks
 * exist to give fast feedback, not to provide security: never trust them alone.
 */

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file
export const MAX_TOTAL_BYTES = 25 * 1024 * 1024; // 25 MB per submission

/** Extension is checked alongside MIME type because browsers report both loosely. */
export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
] as const;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
] as const;

export const ACCEPT_ATTRIBUTE = [
  ...ALLOWED_EXTENSIONS,
  ...ALLOWED_MIME_TYPES,
].join(',');

export const FILE_RULES_TEXT = `PDF, Word, Excel, PNG, or JPG. Up to ${MAX_FILES} files, ${formatBytes(
  MAX_FILE_BYTES
)} each.`;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export interface FileValidationResult {
  accepted: File[];
  errors: string[];
}

/**
 * Validates a set of newly selected files against the files already staged.
 * Returns the files that may be added plus human-readable errors for the rest.
 */
export function validateFiles(
  incoming: File[],
  existing: File[] = [],
  maxFiles: number = MAX_FILES
): FileValidationResult {
  const accepted: File[] = [];
  const errors: string[] = [];

  let totalBytes = existing.reduce((sum, f) => sum + f.size, 0);
  let count = existing.length;

  for (const file of incoming) {
    if (count >= maxFiles) {
      errors.push(
        `${file.name} was not added. A maximum of ${maxFiles} file${
          maxFiles === 1 ? '' : 's'
        } can be attached.`
      );
      continue;
    }

    const duplicate =
      existing.some((f) => f.name === file.name && f.size === file.size) ||
      accepted.some((f) => f.name === file.name && f.size === file.size);
    if (duplicate) {
      errors.push(`${file.name} has already been attached.`);
      continue;
    }

    const typeAllowed =
      (ALLOWED_MIME_TYPES as readonly string[]).includes(file.type) ||
      hasAllowedExtension(file.name);
    if (!typeAllowed) {
      errors.push(
        `${file.name} is not an accepted file type. Accepted types: PDF, Word, Excel, PNG, JPG.`
      );
      continue;
    }

    if (file.size === 0) {
      errors.push(`${file.name} appears to be empty.`);
      continue;
    }

    if (file.size > MAX_FILE_BYTES) {
      errors.push(
        `${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(
          MAX_FILE_BYTES
        )} per file.`
      );
      continue;
    }

    if (totalBytes + file.size > MAX_TOTAL_BYTES) {
      errors.push(
        `${file.name} was not added. Attachments total more than ${formatBytes(
          MAX_TOTAL_BYTES
        )}.`
      );
      continue;
    }

    accepted.push(file);
    totalBytes += file.size;
    count += 1;
  }

  return { accepted, errors };
}
