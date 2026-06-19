const LOCAL_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4000'];

/**
 * Allowed browser origins (comma-separated in CORS_ORIGIN).
 * Example: https://hina-japanese-app.vercel.app,https://hina-japanese-app-git-main-xxx.vercel.app
 */
export function getAllowedOrigins() {
  const fromEnv =
    process.env.CORS_ORIGIN?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  if (process.env.NODE_ENV === 'development') {
    return [...new Set([...LOCAL_ORIGINS, ...fromEnv])];
  }

  return [...new Set(fromEnv)];
}

/** 
 * Vercel preview URLs: https://<project>-<hash>-<team>.vercel.app 
 * @param {string} origin
 */
function isVercelPreview(origin) {
  return /^https:\/\/[\w-]+\.vercel\.app$/.test(origin);
}

/**
 * CORS Origin Delegate
 * @param {string | undefined} origin
 * @param {(err: Error | null, allow?: boolean) => void} callback
 */
export function corsOriginDelegate(origin, callback) {
  const allowed = getAllowedOrigins();

  // Non-browser (curl, health checks) or same-origin
  if (!origin) {
    callback(null, true);
    return;
  }

  if (allowed.includes(origin)) {
    callback(null, true);
    return;
  }

  // Optional: allow Vercel preview deploys when production origin is in the list
  if (allowed.some((o) => o.includes('.vercel.app')) && isVercelPreview(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS: origin not allowed: ${origin}`), false);
}
