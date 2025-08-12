import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Protected({ children, role }: { children: React.ReactNode; role?: 'admin'|'company' }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="p-6">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.role !== role) return <div className="p-6">Forbidden</div>
  return <>{children}</>
}
