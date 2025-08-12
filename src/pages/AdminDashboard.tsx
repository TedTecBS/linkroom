import { functions, httpsCallable } from '@/integrations/firebase'
import Protected from '@/components/Protected'
import { useState } from 'react'

export default function AdminDashboard() {
  return (
    <Protected role="admin">
      <AdminPost />
    </Protected>
  )
}

function AdminPost() {
  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('Linkroom')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    const call = httpsCallable(functions, 'adminPostJob')
    const res = await call({ title, description, companyName })
    setMsg(`Posted! Job ID: ${(res.data as any).id}`)
    setTitle(''); setDescription('')
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="text-xl font-semibold mb-4">Admin: Post a Job (includes ads)</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Company" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
        <textarea className="w-full border rounded p-2" placeholder="Description" rows={8} value={description} onChange={e=>setDescription(e.target.value)} />
        <button className="px-4 py-2 rounded bg-primary text-white">Publish</button>
      </form>
      {msg && <p className="mt-3 text-green-700">{msg}</p>}
    </div>
  )
}
