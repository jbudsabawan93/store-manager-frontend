import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AppShell({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">Storefront</span>
        </div>
        <nav className="topbar__nav">
          <NavLink to="/products" className="nav-link">
            สินค้า
          </NavLink>
          <NavLink to="/master-data" className="nav-link">
            ข้อมูลหลัก
          </NavLink>
        </nav>
        <button type="button" className="btn btn--ghost" onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </header>
      <main className="shell__main">{children}</main>
    </div>
  )
}
