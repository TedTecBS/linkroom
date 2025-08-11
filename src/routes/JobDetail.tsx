import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import AdSlot from '../components/AdSlot'
import { getJob } from '../services/jobs'

const JobDetail = () => {
  const { id } = useParams()
  const { data: job } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id!),
    enabled: !!id,
  })

  if (!job) return <div className="p-4">Job not found</div>

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      {job.includeAds && (
        <AdSlot slotId={import.meta.env.VITE_ADSENSE_SLOT_JOB_DETAIL} />
      )}
      <p>{job.description}</p>
      {job.includeAds && (
        <AdSlot
          slotId={import.meta.env.VITE_ADSENSE_SLOT_JOB_DETAIL}
          className="mt-4"
        />
      )}
    </div>
  )
}

export default JobDetail
