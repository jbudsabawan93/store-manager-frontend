import { apiRequest } from './client'
import { clearAccessToken, setAccessToken } from './authStorage'

export type LoginResponse = {
  access_token: string
}

export async function loginApi(email: string, password: string) {
  const data = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  })

  if (!data?.access_token) {
    throw new Error('ไม่ได้รับ access_token จากเซิร์ฟเวอร์')
  }

  setAccessToken(data.access_token)
  return data
}

export function logoutLocal() {
  clearAccessToken()
}
