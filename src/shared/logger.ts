type Level = "debug" | "info" | "warn" | "error";

const emit = (level: Level, message: string, context?: Record<string, unknown>): void => {
  const line = JSON.stringify({ level, message, ts: new Date().toISOString(), ...context });
  if (level === "error" || level === "warn") console.error(line);
  else console.log(line);
};

// ponytail: Vercel already collects stdout and adds request ids. Swap in pino or
// Sentry here when structured sampling or alerting becomes a requirement.
export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => emit("debug", m, c),
  info: (m: string, c?: Record<string, unknown>) => emit("info", m, c),
  warn: (m: string, c?: Record<string, unknown>) => emit("warn", m, c),
  error: (m: string, c?: Record<string, unknown>) => emit("error", m, c),
};
