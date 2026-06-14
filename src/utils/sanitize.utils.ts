// Recursively strip MongoDB operator keys ($gt, $ne, etc.) and dotted keys
// from user-supplied objects to prevent NoSQL injection via req.body / req.query.
export const sanitizeInput = <T>(value: T): T => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return value.trim() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeInput(item)) as T;
  }

  if (typeof value !== 'object') {
    return value;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    sanitized[key] = sanitizeInput(nestedValue);
  }

  return sanitized as T;
};
