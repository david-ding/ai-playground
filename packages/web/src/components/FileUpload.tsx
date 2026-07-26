import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '../hooks/useUpload';

const DEFAULT_ACCEPTED_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/octet-stream': ['.bin'],
};

function formatAcceptedExtensions(types: Record<string, string[]>): string {
  return Object.values(types).flat().join(', ');
}

interface FileUploadProps {
  acceptedTypes?: Record<string, string[]>;
}

export default function FileUpload({ acceptedTypes = DEFAULT_ACCEPTED_TYPES }: FileUploadProps) {
  const { upload, state, reset, abort } = useUpload();
  const [validationError, setValidationError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setValidationError(null);
      const file = accepted[0];
      if (!file) return;
      upload(file);
    },
    [upload],
  );

  const onDropRejected = useCallback(() => {
    setValidationError(
      `File type not accepted. Accepted types: ${formatAcceptedExtensions(acceptedTypes)}`,
    );
  }, [acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: acceptedTypes,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg w-full border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? 'border-input-border-active bg-input-surface' : 'border-input-border hover:border-input-border-hover'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-input-foreground">Drop the file here...</p>
        ) : (
          <p className="text-muted">Drag & drop a file here, or click to select</p>
        )}
      </div>

      {validationError && (
        <div className="flex items-center justify-between rounded-lg border border-danger-border bg-danger-surface p-4">
          <p className="text-sm text-danger-foreground">{validationError}</p>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="rounded bg-btn-danger px-3 py-1 text-xs text-btn-foreground hover:bg-btn-danger-hover"
          >
            Dismiss
          </button>
        </div>
      )}

      {state.status === 'requesting-url' && (
        <p className="text-sm text-muted">Requesting upload URL...</p>
      )}

      {state.status === 'uploading' && (
        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-progress-track">
            <div
              className="h-full rounded-full bg-btn-primary transition-all duration-200"
              style={{ width: `${state.progress * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted">{Math.round(state.progress * 100)}% uploaded</p>
          <button
            type="button"
            onClick={abort}
            className="rounded bg-btn-ghost px-3 py-1 text-xs text-btn-ghost-foreground hover:bg-btn-ghost-hover"
          >
            Cancel
          </button>
        </div>
      )}

      {state.status === 'done' && state.result && (
        <p className="text-sm text-success">
          Uploaded!{' '}
          <a href={state.result.fileUrl} target="_blank" rel="noreferrer" className="underline">
            View file
          </a>
        </p>
      )}

      {state.status === 'error' && (
        <div className="flex items-center justify-between rounded-lg border border-danger-border bg-danger-surface p-4">
          <p className="text-sm text-danger-foreground">{state.error}</p>
          <button
            type="button"
            onClick={reset}
            className="rounded bg-btn-danger px-3 py-1 text-xs text-btn-foreground hover:bg-btn-danger-hover"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === 'done' && (
        <button
          type="button"
          onClick={reset}
          className="rounded bg-btn-primary px-4 py-2 text-sm text-btn-foreground hover:bg-btn-primary-hover"
        >
          Upload another
        </button>
      )}
    </div>
  );
}
