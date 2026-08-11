import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { loginApi, logoutLocal } from '../api/auth'
import { getAccessToken } from '../api/authStorage'

interface AuthContextValue {
  isAuthenticated: boolean
  accessToken: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() =>
    getAccessToken(),
  )
  const [loading] = useState(false)

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password)
    setAccessTokenState(data.access_token)
  }

  const logout = async () => {
    logoutLocal()
    setAccessTokenState(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(accessToken),
        accessToken,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
