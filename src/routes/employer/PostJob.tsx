import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Button from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { getTokensRemaining } from '../../services/companies'
import { postEmployerJob } from '../../services/jobs'

const EmployerPostJob = () => {
  const { role, companyId } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { data: tokens } = useQuery({
    queryKey: ['tokens', companyId],
    queryFn: () => getTokensRemaining(companyId!),
    enabled: !!companyId,
  })

  if (role !== 'employer' || !companyId) return <Navigate to="/" />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await postEmployerJob({ title, description })
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h1 className="text-xl font-bold">
        Post Job (Tokens remaining: {tokens ?? 0})
      </h1>
      <input
        className="border p-2 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        className="border p-2 w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <Button type="submit">Post</Button>
    </form>
  )
}

export default EmployerPostJob
