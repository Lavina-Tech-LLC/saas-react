import { createTranslate, dictionaries, normalizeLocale, resolveLocale } from '.';

describe('createTranslate', () => {
  it('interpolates {placeholders}', () => {
    expect(createTranslate('en')('error.passwordTooShort', { min: 8 })).toBe('Password must be at least 8 characters');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(createTranslate('en')('error.passwordTooShort', {})).toContain('{min}');
  });
});

describe('locales', () => {
  it('ru and uz translate every English key', () => {
    const keys = Object.keys(dictionaries.en).sort();
    expect(Object.keys(dictionaries.ru).sort()).toEqual(keys);
    expect(Object.keys(dictionaries.uz).sort()).toEqual(keys);
  });
});

describe('resolveLocale', () => {
  it('prefers the explicit locale, normalising regional tags', () => {
    expect(normalizeLocale('ru-RU')).toBe('ru');
    expect(resolveLocale('uz', 'ru')).toBe('uz');
  });

  it('falls back to the project default', () => {
    expect(resolveLocale(undefined, 'ru')).toBe('ru');
  });
});
