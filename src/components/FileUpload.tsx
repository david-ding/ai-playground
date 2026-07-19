import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getPresignedUrl, type PresignedUrlResponse } from '../api';

const ACCEPTED_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/octet-stream': ['.bin'],
};

interface UploadState {
  status: 'idle' | 'requesting-url' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
  result?: PresignedUrlResponse;
}

export default function FileUpload() {
  const [upload, setUpload] = useState<UploadState>({ status: 'idle', progress: 0 });

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;

    setUpload({ status: 'requesting-url', progress: 0 });

    try {
      const presigned = await getPresignedUrl(file.name, file.type, file.size);

      setUpload({ status: 'uploading', progress: 0 });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUpload((prev) => ({ ...prev, progress: e.loaded / e.total }));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', presigned.uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      setUpload({ status: 'done', progress: 1, result: presigned });
    } catch (err) {
      setUpload((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-indigo-600">Drop the file here...</p>
        ) : (
          <p className="text-gray-500">Drag & drop a file here, or click to select</p>
        )}
      </div>

      {upload.status === 'requesting-url' && (
        <p className="text-sm text-gray-500">Requesting upload URL...</p>
      )}

      {upload.status === 'uploading' && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-200"
              style={{ width: `${upload.progress * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">{Math.round(upload.progress * 100)}% uploaded</p>
        </div>
      )}

      {upload.status === 'done' && upload.result && (
        <p className="text-sm text-green-600">
          Uploaded!{' '}
          <a href={upload.result.fileUrl} target="_blank" rel="noreferrer" className="underline">
            View file
          </a>
        </p>
      )}

      {upload.status === 'error' && <p className="text-sm text-red-600">{upload.error}</p>}

      {upload.status === 'done' && (
        <button
          type="button"
          onClick={() => setUpload({ status: 'idle', progress: 0 })}
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
        >
          Upload another
        </button>
      )}
    </div>
  );
}
