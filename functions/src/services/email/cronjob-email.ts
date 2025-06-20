// Import necessary modules and types
import { Locale } from '../../types/languages';
import { emailContent } from '../../lib/email';
import { sendEmail } from './send-email'; // Adjust the path as necessary
import { dbAdmin } from '../../lib/firebase-admin';

// Define the function
export const createdArticleEmail = async (clientId: string, lang: string, id: string) => {
  try {
    // Validate required fields
    if (!clientId || !lang) {
      throw new Error('Missing required fields');
    }

    if (!id) {
      throw new Error('Failed to create a new article');
    }

    // Step 2: Fetch the created article
    const articleDocPath = `${clientId}/${lang}/articles/${id}`;
    const snapshot = await dbAdmin.doc(articleDocPath).get();

    if (!snapshot.exists) {
      throw new Error('Article not found after creation');
    }

    const article = snapshot.data();

    if (!article) {
      throw new Error('Failed to retrieve article data');
    }

    const teamReceiverEmail = 'contact@inceptionai.ca';

    const teamEmail = emailContent({
      href: `${article.href}?clientId=${clientId}`,
      lang: lang as Locale,
      linkedinPosts: null,
      facebookPosts: null,
      twitterPosts: null,
      subject: article.title,
      thumbnail: article.thumbnail,
      isNewArticleCreated: true,
    });

    if (!teamEmail) {
      throw new Error('Failed to generate team email content');
    }

    await sendEmail(teamEmail, teamReceiverEmail);

    // Step 7: Return success and article ID
    return { id, lang };
  } catch (error) {
    console.error('Error in createArticle:', error);
    throw new Error('Internal server error');
  }
};
