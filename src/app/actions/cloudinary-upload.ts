'use server';

import cloudinary from '@/lib/cloudinary';

/**
 * Server Action pour téléverser une image sur Cloudinary.
 * Accepte tous les formats grâce à resource_type: 'auto' et transforme en formats web modernes.
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
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // Gère images, vidéos et fichiers bruts
        folder: `one-vibe/${folder}`,
        // Optimisation automatique vers WebP/AVIF selon le navigateur
        fetch_format: 'auto',
        quality: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary Upload Error:', error);
          reject(new Error(error?.message || 'Erreur lors du téléversement vers Cloudinary'));
          return;
        }
        resolve({ url: result.secure_url });
      }
    );
    
    uploadStream.end(buffer);
  });
}
