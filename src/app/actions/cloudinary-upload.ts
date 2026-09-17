
'use server';

import cloudinary from '@/lib/cloudinary';

/**
 * Server Action pour téléverser une image sur Cloudinary.
 * Prend un FormData contenant le fichier 'file' et un 'folder' optionnel.
 */
export async function uploadToCloudinary(formData: FormData) {
  const file = formData.get('file') as File;
  const folder = (formData.get('folder') as string) || 'one-vibe';

  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  // Conversion du fichier en buffer pour l'upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: `one-vibe/${folder}`,
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message || 'Erreur lors du téléversement'));
          return;
        }
        resolve({ url: result.secure_url });
      }
    ).end(buffer);
  });
}
