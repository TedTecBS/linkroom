import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { postAdminJob } from '../../services/jobs'

const AdminPostJob = () => {
  const { role } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  if (role !== 'admin') return <Navigate to="/" />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await postAdminJob({ title, description })
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Post Job</h1>
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

export default AdminPostJob
