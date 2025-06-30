import { bucket } from '../../lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export const saveImageStorage = async (url: string, clientId: string, subject: string): Promise<string> => {
  const image = await fetch(url);
  const buffer = Buffer.from(await image.arrayBuffer());

  const id = subject.replace(/ /g, '-').toLowerCase();

  const uniqueSuffix = uuidv4();
  let filePath = `images/${clientId}/${id ?? 'new'}-${uniqueSuffix}.png`;

  const file = bucket.file(filePath);

  // Save the file with the buffer and metadata
  await file.save(buffer, {
    metadata: {
      contentType: 'image/png',
    },
  });

  await file.makePublic();

  return file.publicUrl();
};
