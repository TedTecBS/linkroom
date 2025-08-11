import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listJobs } from '../services/jobs'

const JobsList = () => {
  const { data } = useQuery({ queryKey: ['jobs'], queryFn: listJobs })

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Jobs</h1>
      <ul className="space-y-2">
        {data?.map((job) => (
          <li key={job.id}>
            <Link to={`/jobs/${job.id}`} className="text-blue-600 underline">
              {job.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default JobsList
