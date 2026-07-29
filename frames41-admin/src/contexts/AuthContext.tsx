import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import { setTokens, getAccessToken, getRefreshToken, clearTokens } from '@/lib/token'

interface AdminUser {
  userId: string
  email: string
  name: string | null
  role: string
}

interface AuthState {
  user: AdminUser | null
  isLoading: boolean
}

type AuthAction =
  | { type: 'SET_USER'; user: AdminUser }
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
  user: AdminUser | null
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, isLoading: true })

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      dispatch({ type: 'CLEAR_USER' })
      return
    }
    api.users.getProfile()
      .then((profile) => {
        dispatch({
          type: 'SET_USER',
          user: {
            userId: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
          },
        })
      })
      .catch(() => {
        clearTokens()
        dispatch({ type: 'CLEAR_USER' })
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.info('[Frames41 Auth] Dashboard login started', { email })
      const result = await api.auth.login(email, password)
      console.info('[Frames41 Auth] Dashboard login token received')
      setTokens(result.accessToken, result.refreshToken, result.expiresIn)

      const profile = await api.users.getProfile()
      console.info('[Frames41 Auth] Dashboard profile loaded', {
        email: profile.email,
        role: profile.role,
      })

      if (profile.role !== 'ADMIN') {
        clearTokens()
        throw new Error('Access denied: admin role required')
      }

      dispatch({
        type: 'SET_USER',
        user: {
          userId: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
        },
      })
    } catch (error) {
      clearTokens()
      console.error('[Frames41 Auth] Dashboard login failed', error)
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      await api.auth.logout(refreshToken).catch(() => {})
    }
    clearTokens()
    dispatch({ type: 'CLEAR_USER' })
  }, [])

  return (
    <AuthContext.Provider value={{
      user: state.user,
      isAdmin: state.user?.role === 'ADMIN',
      isLoading: state.isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}