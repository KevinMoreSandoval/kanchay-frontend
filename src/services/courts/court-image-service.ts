import { apiRequest } from '../http-client';
import type { CourtPhoto } from '@/types/courts';

// Reutilizar subidas exitosas si el guardado de la cancha falla y se reintenta.
const uploaded = new WeakMap<CourtPhoto, Promise<string>>();

function imageBlob(src: string): Blob {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(src);
  if (!match) throw new Error('La imagen no es válida. Usa JPG, PNG o WebP.');
  const bytes = Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0));
  if (bytes.length === 0 || bytes.length > 2 * 1024 * 1024) {
    throw new Error('Cada imagen debe tener contenido y pesar hasta 2 MB.');
  }
  return new Blob([bytes], { type: match[1] });
}

async function uploadPhoto(photo: CourtPhoto, token: string): Promise<string> {
  const file = imageBlob(photo.src);
  const body = new FormData();
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  body.append('file', file, `cancha.${extension}`);
  const response = await apiRequest<{ url: string }>('/canchas/imagenes', {
    method: 'POST',
    body,
    token,
  });
  if (typeof response.url !== 'string' || !response.url.startsWith('https://')) {
    throw new Error('El servidor no devolvió una URL válida para la imagen.');
  }
  return response.url;
}

export async function resolveCourtPhotos(
  photos: CourtPhoto[],
  token: string
): Promise<CourtPhoto[]> {
  const resolved: CourtPhoto[] = [];
  for (const photo of photos) {
    if (!photo.src.startsWith('data:')) {
      resolved.push(photo);
      continue;
    }
    let upload = uploaded.get(photo);
    if (!upload) {
      upload = uploadPhoto(photo, token).catch((err: unknown) => {
        uploaded.delete(photo);
        throw err;
      });
      uploaded.set(photo, upload);
    }
    resolved.push({ ...photo, src: await upload });
  }
  return resolved;
}
