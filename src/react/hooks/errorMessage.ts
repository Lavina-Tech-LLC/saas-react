/** The message shown to the user for a failed call: the server's message, else the fallback. */
export const errorMessage = (err: unknown, fallback: string): string => (err instanceof Error ? err.message : fallback);
