// src/lib/validators.ts
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidCode(code: string): boolean {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}
