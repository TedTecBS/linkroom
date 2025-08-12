import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db, functions } from '@/integrations/firebase'
import { useAuth } from '@/context/AuthContext'
import Protected from '@/components/Protected'
import { httpsCallable } from 'firebase/functions'
import { useEffect, useState } from 'react'

export default function CompanyDashboard() {
  return (
    <Protected role="company">
      <CompanyPanel />
    </Protected>
  )
}

function CompanyPanel() {
  const { user } = useAuth()
  const [tokens, setTokens] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      if (!user) return
      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, { role: 'company', tokens: 0 })
        setTokens(0)
      } else setTokens((snap.data() as any).tokens ?? 0)
      setLoading(false)
    })()
  }, [user])

  const addTokens = async () => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), { tokens: tokens + 5 })
    setTokens(t => t + 5)
  }

  if (loading) return <div className="p-4">Loading…</div>

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="text-xl font-semibold">Company Dashboard</h2>
      <p className="mt-2">Tokens: <b>{tokens}</b></p>
      <button className="mt-2 px-3 py-1 border rounded" onClick={addTokens}>Add 5 tokens (demo)</button>
      <PostJobForm onPosted={() => {}} />
    </div>
  )
}

function PostJobForm({ onPosted }: { onPosted: () => void }) {
  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    const call = httpsCallable(functions, 'postJob')
    const res = await call({ title, description, companyName })
    setMsg(`Posted! Job ID: ${(res.data as any).id} (ad-free)`)
    setTitle(''); setDescription(''); setCompanyName('')
    onPosted()
  }

  return (
    <form onSubmit={submit} className="space-y-3 mt-6">
      <h3 className="font-semibold">Post a Job (ad‑free, token cost 1)</h3>
      <input className="w-full border rounded p-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="w-full border rounded p-2" placeholder="Company" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
      <textarea className="w-full border rounded p-2" placeholder="Description" rows={8} value={description} onChange={e=>setDescription(e.target.value)} />
      <button className="px-4 py-2 rounded bg-primary text-white">Publish</button>
      {msg && <p className="text-green-700">{msg}</p>}
    </form>
  )
}
