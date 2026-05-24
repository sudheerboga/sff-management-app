import { useAuthStore } from '@/stores/authStore';
import { CloudinaryConfig } from '@/types';

export function useBoutiqueCloudinary(): CloudinaryConfig | undefined {
  const user = useAuthStore((s) => s.user);
  if (!user?.cloudinary?.cloudName || !user.cloudinary.uploadPreset) return undefined;
  return {
    ...user.cloudinary,
    folder: user.cloudinary.folder || `boutiques/${user.boutiqueId}`,
  };
}
