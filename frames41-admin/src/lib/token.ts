const KEYS = {
  access: 'frames41_access_token',
  refresh: 'frames41_refresh_token',
  expiry: 'frames41_token_expiry',
} as const

export function getAccessToken(): string | null {
  return localStorage.getItem(KEYS.access)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(KEYS.refresh)
}

export function setTokens(access: string, refresh: string, expiresIn: number): void {
  const expiry = Date.now() + expiresIn * 1000
  localStorage.setItem(KEYS.access, access)
  localStorage.setItem(KEYS.refresh, refresh)
  localStorage.setItem(KEYS.expiry, String(expiry))
}

export function clearTokens(): void {
  localStorage.removeItem(KEYS.access)
  localStorage.removeItem(KEYS.refresh)
  localStorage.removeItem(KEYS.expiry)
}

export function isTokenExpiringSoon(): boolean {
  const expiry = localStorage.getItem(KEYS.expiry)
  if (!expiry) return false
  return Date.now() > Number(expiry) - 30_000
}
