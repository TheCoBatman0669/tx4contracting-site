'use client';

import { useId, useRef, useState } from 'react';
import { Paperclip, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  validateFiles,
  formatBytes,
  ACCEPT_ATTRIBUTE,
  MAX_FILES,
  MAX_FILE_BYTES,
} from '@/lib/file-validation';

interface FileAttachmentsFieldProps {
  label: string;
  description?: string;
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function FileAttachmentsField({
  label,
  description,
  files,
  onChange,
  maxFiles = MAX_FILES,
  disabled = false,
}: FileAttachmentsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const inputId = useId();
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-errors`;

  const handleSelect = (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;

    const { accepted, errors: newErrors } = validateFiles(
      Array.from(selected),
      files,
      maxFiles
    );

    setErrors(newErrors);

    if (accepted.length > 0) {
      onChange([...files, ...accepted]);
      setAnnouncement(
        `${accepted.length} file${accepted.length === 1 ? '' : 's'} attached.`
      );
    }

    // Reset so selecting the same file again still fires a change event.
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const removed = files[index];
    onChange(files.filter((_, i) => i !== index));
    setAnnouncement(`${removed.name} removed.`);
  };

  const atLimit = files.length >= maxFiles;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-navy-900 mb-1"
      >
        {label}
      </label>
      <p id={descriptionId} className="text-sm text-steel-600 mb-3">
        {description ? `${description} ` : ''}
        Accepted: PDF, Word, Excel, PNG, JPG. Up to {maxFiles} file
        {maxFiles === 1 ? '' : 's'}, {formatBytes(MAX_FILE_BYTES)} each. Do not
        attach classified, controlled, or otherwise restricted material.
      </p>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple={maxFiles > 1}
        accept={ACCEPT_ATTRIBUTE}
        onChange={(e) => handleSelect(e.target.files)}
        disabled={disabled || atLimit}
        aria-describedby={`${descriptionId}${errors.length ? ` ${errorId}` : ''}`}
        className="block w-full text-sm text-steel-700 file:mr-4 file:rounded-md file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-800 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-steel-300 rounded-md p-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-navy-700 focus-within:ring-offset-2"
      />

      {atLimit && (
        <p className="mt-2 text-sm text-steel-600">
          Attachment limit reached. Remove a file to add another.
        </p>
      )}

      {errors.length > 0 && (
        <ul id={errorId} className="mt-3 space-y-1" role="alert">
          {errors.map((error) => (
            <li key={error} className="text-sm text-destructive">
              {error}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-3 rounded-md border border-steel-200 bg-steel-50 px-4 py-2.5"
            >
              <FileText
                className="h-4 w-4 shrink-0 text-steel-500"
                aria-hidden="true"
              />
              <span className="flex-1 min-w-0">
                <span className="block truncate text-sm font-medium text-navy-900">
                  {file.name}
                </span>
                <span className="block text-xs text-steel-500">
                  {formatBytes(file.size)}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="shrink-0 text-steel-600 hover:text-destructive"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Remove {file.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {files.length === 0 && !atLimit && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-steel-500">
          <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
          No files attached yet. Attachments are optional.
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
