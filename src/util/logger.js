// Minimal logger wrapper — swap out for winston or similar later if desired
module.exports = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => console.debug ? console.debug('[DEBUG]', ...args) : console.log('[DEBUG]', ...args),
};
