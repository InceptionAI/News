import { ClientInfo } from '../../types/client-info';
import { createImage } from './create-image';

export const createNewImage = async ({
  clientId,
  clientInfo,
  subject,
}: {
  clientId: string;
  clientInfo?: ClientInfo;
  subject: string;
}): Promise<{ picture: string; url: string }> => {
  const date = new Date();
  console.log(`Started creating image for "${subject}"`);
  const { url } = await createImage({ subject, clientInfo, clientId });

  if (!url) {
    console.error('Failed to create image');
    return { picture: '', url: '' };
  }

  const picture = `<img src=${url} alt=${subject} width="400" height="225" />`;

  console.log('Finished creating image in ', new Date().getTime() - date.getTime(), 'ms');
  return { picture, url };
};
