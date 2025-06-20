import { Timestamp } from 'firebase-admin/firestore';
import { StylePreferences } from '../private/image-prompt';
import { Locale } from './languages';

type Allowed = {
  [key: string]: boolean;
};

export type NextIdeas = {
  title: string;
  date: Timestamp;
  new?: boolean;
};

export type PartialNextIdeas = {
  title: string;
  date?: Timestamp;
  new?: boolean;
};

export type FrequencyArticle = 'times-week-7' | 'times-week-4' | 'times-week-3' | 'times-week-2' | 'times-week-1';

export type ClientInfo = {
  allowed?: Allowed;
  clientId?: string;
  companyName: string;
  companyState?: string;
  contact?: string;
  CTA: string;
  defaultAuthor?: string;
  defaultLang?: Locale;
  domain: string;
  frequency?: FrequencyArticle;
  ideas: string[];
  mission: string;
  nextIdeas?: NextIdeas[];
  region?: string;
  startDate: Timestamp;
  stylePreferences: StylePreferences;
  targetAudience: string;
  UID?: string[];
};
