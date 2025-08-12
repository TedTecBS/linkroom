import { useAuth } from '@/context/AuthContext'
export default function Login() {
  const { login } = useAuth()
  return (
    <div className="p-6 flex items-center justify-center">
      <button className="px-4 py-2 bg-primary text-white rounded" onClick={login}>
        Continue with Google
      </button>
    </div>
  )
}
