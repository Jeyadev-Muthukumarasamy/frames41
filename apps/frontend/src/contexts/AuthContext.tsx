import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import { setTokens, getAccessToken, getRefreshToken, clearTokens, isTokenExpiringSoon } from '@/lib/token'

interface AuthUser {
  userId: string
  email: string
  name: string | null
  phone: string | null
  role: string
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
}

type AuthAction =
  | { type: 'SET_USER'; user: AuthUser }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; loading: boolean }

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user, isLoading: false }
    case 'CLEAR_USER':
      return { ...state, user: null, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }
  }
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithPhone: (phone: string) => Promise<{ isNewUser: boolean }>
  sendOtp: (phone: string) => Promise<{ expiresIn: number }>
  verifyOtp: (phone: string, code: string) => Promise<{ isNewUser: boolean }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUser(profile: any): AuthUser {
  return {
    userId: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    role: profile.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, isLoading: true })

  useEffect(() => {
    const token = getAccessToken()
    if (!token || isTokenExpiringSoon()) {
      clearTokens()
      dispatch({ type: 'CLEAR_USER' })
      return
    }

    api.users.getProfile().then((profile) => {
      dispatch({ type: 'SET_USER', user: toUser(profile) })
    }).catch(() => {
      clearTokens()
      dispatch({ type: 'CLEAR_USER' })
    })
  }, [])

  const loginWithPhone = useCallback(async (phone: string) => {
    const result = await api.auth.phoneLogin(phone)
    setTokens(result.accessToken, result.refreshToken, result.expiresIn)
    const profile = await api.users.getProfile()
    dispatch({ type: 'SET_USER', user: toUser(profile) })
    return { isNewUser: result.isNewUser }
  }, [])

  const sendOtp = useCallback(async (phone: string) => {
    const res = await api.auth.sendOtp(phone)
    return { expiresIn: res.expiresIn }
  }, [])

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const result = await api.auth.verifyOtp(phone, code)
    setTokens(result.accessToken, result.refreshToken, result.expiresIn)
    const profile = await api.users.getProfile()
    dispatch({ type: 'SET_USER', user: toUser(profile) })
    return { isNewUser: result.isNewUser }
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      await api.auth.logout(refreshToken).catch(() => {})
    }
    clearTokens()
    dispatch({ type: 'CLEAR_USER' })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
      user: state.user,
      isAuthenticated: state.user !== null,
      isLoading: state.isLoading,
      loginWithPhone,
      sendOtp,
      verifyOtp,
      logout,
    }), [state.user, state.isLoading, loginWithPhone, sendOtp, verifyOtp, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}