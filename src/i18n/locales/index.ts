import { en } from './en';
import { ru } from './ru';
import { uz } from './uz';

export type { Dictionary, TranslationKey } from './en';
export { en };
export const dictionaries = { en, ru, uz } as const;
