'use server';

import cloudinary from '@/lib/cloudinary';

/**
 * Server Action pour téléverser une image sur Cloudinary de manière stable.
 * Gère automatiquement le format de fichier grâce à resource_type: 'auto'.
 */
export async function uploadToCloudinary(formData: FormData) {
  const file = formData.get('file') as File;
  const folder = (formData.get('folder') as string) || 'one-vibe';

  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  // Vérification basique du type de fichier
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  // Conversion du fichier en buffer pour l'upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: `one-vibe/${folder}`,
        // Optimisation automatique de la qualité et du format
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
