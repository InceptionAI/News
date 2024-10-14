import { Timestamp } from 'firebase-admin/firestore';
import { Locale } from './languages';

export type Article = {
  href: string;
  content: string;
  created: Timestamp;
  id: string;
  thumbnail: string;
  title: string;
  published: boolean; // Default value is false
  dataset?: string;
  author?: string;
  metadata?: {
    title: string;
    description: string;
    keywords: string;
  };
  prompt: {
    content: string;
    thumbnail?: string;
  };
  translation?: Partial<Record<Locale, string>>;
};
