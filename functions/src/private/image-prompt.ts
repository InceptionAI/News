export type StylePreferences = 'retro-style cartoonish' | 'cinematic' | 'cartoonish 3D illustration' | 'realistic';

export const createImagePrompt = ({
  subject,
  style,
  coreElements,
}: {
  subject: string;
  style?: StylePreferences;
  coreElements?: string | null;
}): string => {
  return `Create a ${style} image on the subject of "${subject}".\
 ${coreElements ?? 'The image features 3 main elements to picturize the subject'}\
 The color palette is fresh and natural, using soft colors.\
 Ensuring the image remains clean and uncluttered.\
 Minimal and visually engaging design, with an emphasis on simplicity and clarity.\
 Avoid showing people, even in silhouette, try to use objects instead.\
 Without text, letters, or symbols resembling big text text or letters.\
 This image ratio is 16:9.`;
};
