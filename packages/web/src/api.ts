const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  fileKey: string;
}

export async function getPresignedUrl(
  fileName: string,
  contentType: string,
  fileSize?: number,
  signal?: AbortSignal,
): Promise<PresignedUrlResponse> {
  const res = await fetch(`${API_BASE}/api/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, contentType, fileSize }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to get upload URL: ${res.statusText}`);
  }

  return res.json();
}
