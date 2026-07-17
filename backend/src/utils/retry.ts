import dns from "dns";

// Prefer IPv4 — many local networks resolve AAAA first but can't route IPv6,
// which surfaces as intermittent ENOTFOUND / EAI_AGAIN to api.airtable.com.
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Older Node versions may not support this; ignore.
}

const RETRYABLE = new Set([
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "EHOSTUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
]);

function errorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const e = err as { code?: string; errno?: string; cause?: { code?: string } };
  return e.code || e.errno || e.cause?.code;
}

function isRetryable(err: unknown): boolean {
  const code = errorCode(err);
  if (code && RETRYABLE.has(code)) return true;
  const message = err instanceof Error ? err.message : String(err);
  return /ENOTFOUND|EAI_AGAIN|getaddrinfo|network|socket/i.test(message);
}

export async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  options: { attempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const attempts = options.attempts ?? 4;
  const baseDelayMs = options.baseDelayMs ?? 400;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === attempts) break;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `[airtable] ${label} failed (${errorCode(err) || "network"}); retry ${attempt}/${attempts - 1} in ${delay}ms`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  const code = errorCode(lastError);
  const friendly = Object.assign(
    new Error(
      code === "ENOTFOUND" || code === "EAI_AGAIN"
        ? "Cannot reach Airtable right now (DNS/network). Check your internet connection and try again."
        : lastError instanceof Error
          ? lastError.message
          : "Airtable request failed"
    ),
    {
      statusCode: 503,
      cause: lastError,
    }
  );
  throw friendly;
}
