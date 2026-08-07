import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/products" replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    window.setTimeout(() => {
      const ok = login(email, password)
      setLoading(false)
      if (ok) navigate('/products')
      else setError('กรุณากรอกอีเมลและรหัสผ่าน')
    }, 400)
  }

  return (
    <div className="login">
      <div className="login__panel">
        <div className="login__intro">
          <span className="brand-mark brand-mark--lg" aria-hidden />
          <h1 className="login__brand">Storefront</h1>
          <p className="login__tagline">จัดการสินค้าได้ง่ายในที่เดียว</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <h2 className="login__title">เข้าสู่ระบบ</h2>
          <p className="login__hint">ใส่อีเมลและรหัสผ่านเพื่อเริ่มใช้งาน</p>

          <label className="field">
            <span>อีเมล</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span>รหัสผ่าน</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
