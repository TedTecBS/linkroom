import { db, doc, getDoc } from '@/integrations/firebase'
import { useEffect, useState } from 'react'
import type { Job } from '@/types'
import { useParams } from 'react-router-dom'
import JobCard from '@/components/JobCard'

export default function JobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState<Job | null>(null)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'jobs', id)).then(s => s.exists() && setJob({ id: s.id, ...(s.data() as any) }))
  }, [id])

  if (!job) return <div className="p-4">Loading…</div>
  return (
    <div className="mx-auto max-w-3xl p-4">
      <JobCard job={job} />
    </div>
  )
}
