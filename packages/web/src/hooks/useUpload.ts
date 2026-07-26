import { useCallback, useEffect, useRef, useState } from 'react';
import { getPresignedUrl, type PresignedUrlResponse } from '../api';

export interface UploadState {
  status: 'idle' | 'requesting-url' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
  result?: PresignedUrlResponse;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const uploadIdRef = useRef(0);

  const abort = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const reset = useCallback(() => {
    abort();
    setState({ status: 'idle', progress: 0 });
  }, [abort]);

  const upload = useCallback(async (file: File) => {
    if (!file) return;

    abort();

    const id = ++uploadIdRef.current;

    setState({ status: 'requesting-url', progress: 0 });

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const presigned = await getPresignedUrl(
        file.name,
        file.type,
        file.size,
        controller.signal,
      );

      if (id !== uploadIdRef.current) return;

      setState({ status: 'uploading', progress: 0 });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setState((prev) => ({ ...prev, progress: e.loaded / e.total }));
          }
        };

        xhr.onload = () => {
          if (id !== uploadIdRef.current) return;
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          if (id !== uploadIdRef.current) return;
          reject(new Error('Upload failed'));
        };

        xhr.onabort = () => {
          if (id !== uploadIdRef.current) return;
          reject(new Error('Upload cancelled'));
        };

        xhr.open('PUT', presigned.uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      if (id !== uploadIdRef.current) return;

      setState({ status: 'done', progress: 1, result: presigned });
    } catch (err) {
      if (id !== uploadIdRef.current) return;

      if (err instanceof DOMException && err.name === 'AbortError') {
        setState({ status: 'idle', progress: 0 });
        return;
      }

      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, [abort]);

  useEffect(() => {
    return () => {
      xhrRef.current?.abort();
      controllerRef.current?.abort();
    };
  }, []);

  return { upload, state, reset, abort };
}
