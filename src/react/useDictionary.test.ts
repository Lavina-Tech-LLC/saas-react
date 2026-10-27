import { dictionaries } from '../i18n';
import { loadDictionary } from '../i18n/loadDictionary';
import type * as LoadDictionary from '../i18n/loadDictionary';
import { renderHook, waitFor } from '../test';
import { useDictionary } from './useDictionary';

vi.mock('../i18n/loadDictionary', async (importOriginal) => {
  const actual = await importOriginal<typeof LoadDictionary>();
  return { loadDictionary: vi.fn(actual.loadDictionary) };
});

describe('loadDictionary', () => {
  it('gives the same words as the built-in dictionaries, for every language', async () => {
    for (const locale of ['en', 'ru', 'uz'] as const) {
      expect(await loadDictionary(locale)).toEqual(dictionaries[locale]);
    }
  });
});

describe('useDictionary', () => {
  it('has English ready on the first render', () => {
    const { result } = renderHook(() => useDictionary('en'));
    expect(result.current).toEqual({ words: dictionaries.en, ready: true });
  });

  it('is not ready until another language has loaded, then gives its words', async () => {
    const { result } = renderHook(() => useDictionary('ru'));
    expect(result.current.ready).toBe(false);
    await waitFor(() => expect(result.current).toEqual({ words: dictionaries.ru, ready: true }));
  });

  it('keeps the last language on screen while the next one loads', async () => {
    const { result, rerender } = renderHook(({ locale }) => useDictionary(locale), {
      initialProps: { locale: 'en' as 'en' | 'uz' },
    });
    rerender({ locale: 'uz' });
    expect(result.current).toEqual({ words: dictionaries.en, ready: true });
    await waitFor(() => expect(result.current.words).toEqual(dictionaries.uz));
  });

  it('falls back to English when a language fails to load, so the app does not wait forever', async () => {
    vi.mocked(loadDictionary).mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useDictionary('ru'));
    await waitFor(() => expect(result.current).toEqual({ words: dictionaries.en, ready: true }));
  });
});
