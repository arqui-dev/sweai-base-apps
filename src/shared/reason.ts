/** The message off an unknown throwable, for logging. Never the whole object. */
export const reasonOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
