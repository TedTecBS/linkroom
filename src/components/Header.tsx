import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { user, profile, login, logout } = useAuth()
  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold">Linkroom</Link>
        <nav className="flex items-center gap-3">
          <Link to="/jobs" className="hover:underline">Jobs</Link>
          {profile?.role === 'admin' && <Link to="/admin" className="hover:underline">Admin</Link>}
          {profile?.role === 'company' && <Link to="/company" className="hover:underline">Company</Link>}
          {!user ? (
            <button onClick={login} className="px-3 py-1 rounded bg-primary text-white">Sign in</button>
          ) : (
            <button onClick={logout} className="px-3 py-1 rounded border">Sign out</button>
          )}
        </nav>
      </div>
    </header>
  )
}
