import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  auth,
  db,
  googleProvider,
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  doc,
  getDoc,
  setDoc
} from '@/integrations/firebase'
import type { Role } from '@/types'

type Profile = { role: Role; tokens?: number } | null

type Ctx = {
  user: User | null
  profile: Profile
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<Ctx>({
  user: null, profile: null, loading: true, login: async () => {}, logout: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) { setProfile(null); setLoading(false); return }
      const ref = doc(db, 'users', u.uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, { role: 'user', tokens: 0 })
        setProfile({ role: 'user', tokens: 0 })
      } else {
        setProfile(snap.data() as Profile)
      }
      setLoading(false)
    })
  }, [])

  const login = async () => { await signInWithPopup(auth, googleProvider) }
  const logout = async () => { await signOut(auth) }

  const value = useMemo(() => ({ user, profile, loading, login, logout }), [user, profile, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
