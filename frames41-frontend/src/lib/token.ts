const KEYS = {
  access: 'frames41_access_token',
  refresh: 'frames41_refresh_token',
  expiry: 'frames41_token_expiry',
} as const

export function getAccessToken(): string | null {
  return localStorage.getItem(KEYS.access)
}

export function setAccessToken(token: string, expiresInSeconds: number): void {
  localStorage.setItem(KEYS.access, token)
  localStorage.setItem(KEYS.expiry, String(Date.now() + expiresInSeconds * 1000))
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(KEYS.refresh)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(KEYS.refresh, token)
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  setAccessToken(accessToken, expiresIn)
  setRefreshToken(refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(KEYS.access)
  localStorage.removeItem(KEYS.refresh)
  localStorage.removeItem(KEYS.expiry)
}

export function isTokenExpiringSoon(): boolean {
  const expiry = localStorage.getItem(KEYS.expiry)
  if (!expiry) return true
  return Date.now() >= Number(expiry) - 30_000
}
