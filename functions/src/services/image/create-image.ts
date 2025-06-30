import { openai } from '../../lib/open-ai';
import { createImagePrompt } from '../../private/image-prompt';
import { ClientInfo } from '../../types/client-info';
import { saveImageStorage } from './save-image-storage';

export const createImage = async ({
  subject,
  clientId,
  clientInfo,
  id,
}: {
  subject: string;
  clientId: string;
  clientInfo?: ClientInfo;
  id?: string;
}): Promise<{ url: string; prompt: string }> => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Ìdentify 3 main objects as vizuale elements to vizualize "${subject}", output them in a singleshort phrase like:  "The image features 3 core elements: element_1, element_2 and element_3".`,
      },
    ],
  });

  const coreElements = completion.choices[0].message?.content;

  const prompt = createImagePrompt({ subject, style: clientInfo?.stylePreferences, coreElements });

  const picture = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    size: '1792x1024',
    quality: 'standard',
    n: 1,
  });

  const url = picture.data[0].url;

  if (!url) {
    return { url: '', prompt };
  }

  const publicUrl = await saveImageStorage(url, clientId, subject);

  if (publicUrl) {
    return { url: publicUrl, prompt };
  } else {
    return { url, prompt };
  }
};
