import { bucket } from '../../lib/firebase-admin';

export const deleteImage = async (imagePath: string) => {
  try {
    // Check if imagePath is a URL or a direct file path
    let filePath;

    if (imagePath.startsWith('https://')) {
      // Extract the file path from the URL
      const fileURL = imagePath;
      const bucketName = bucket.name;
      const decodedURL = decodeURIComponent(fileURL);
      const prefix = `https://storage.googleapis.com/${bucketName}/`;
      filePath = decodedURL.replace(prefix, '');
    } else {
      // Use the thumbnail field directly as the file path
      filePath = imagePath;
    }

    // Delete the file from Firebase Storage
    bucket
      .file(filePath)
      .delete()
      .then(() => {
        console.log('File deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting file:', error);
      });
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
