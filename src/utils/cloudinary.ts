import { CloudinaryConfig, RefImage } from '@/types';

export async function uploadToCloudinary(
  file: File,
  config: CloudinaryConfig,
): Promise<RefImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  if (config.folder) formData.append('folder', config.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || 'Upload failed');
  }

  const data = await res.json() as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id, note: '' };
}
