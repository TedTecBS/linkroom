import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDocs,
  limit,
  orderBy,
  query,
  where,
  QueryConstraint,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Bookmark, Briefcase, Clock, Loader2, MapPin, Search, Star } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Job, JobType, RemoteType, SavedJob } from '@/types';
import { formatRelativeTime, formatCurrency, truncate } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobDetailDrawer } from '@/pages/jobs/components/JobDetailDrawer';
import { jobsCollection, savedJobsCollection } from '@/lib/firestore-collections';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { JobDetailDrawer } from '@/pages/jobs/components/JobDetailDrawer';

type JobsFilterState = {
  search: string;
  location: string;
  remoteType: RemoteType | 'any';
  jobType: JobType | 'any';
  minSalary?: number;
};

const defaultFilters: JobsFilterState = {
  search: '',
  location: '',
  remoteType: 'any',
  jobType: 'any',
  minSalary: undefined,
};

const buildWhereClauses = (filters: JobsFilterState) => {
  const clauses: QueryConstraint[] = [where('status', '==', 'published')];

  if (filters.location.trim()) {
    clauses.push(where('location', '==', filters.location.trim()));
  }
  if (filters.remoteType !== 'any') {
    clauses.push(where('remoteType', '==', filters.remoteType));
  }
  if (filters.jobType !== 'any') {
    clauses.push(where('jobType', '==', filters.jobType));
  }
  if (filters.minSalary) {
    clauses.push(where('salaryMin', '>=', Number(filters.minSalary)));
  }

  return clauses;
};

const fetchJobs = async (filters: JobsFilterState): Promise<Job[]> => {
  const jobsQuery = query(
    jobsCollection(),
    ...buildWhereClauses(filters),
    orderBy('publishedAt', 'desc'),
    limit(25)
  );
  const snapshot = await getDocs(jobsQuery);
  const docs = snapshot.docs.map((docSnap) => docSnap.data());

  if (!filters.search.trim()) {
    return docs;
  }

  const searchTerm = filters.search.trim().toLowerCase();
  return docs.filter((job) => (
    job.title.toLowerCase().includes(searchTerm) ||
    job.location.toLowerCase().includes(searchTerm) ||
    job.description.toLowerCase().includes(searchTerm)
  ));
};

const fetchSavedJobs = async (userId: string): Promise<Record<string, SavedJob>> => {
  const savedSnapshot = await getDocs(
    query(savedJobsCollection(), where('userId', '==', userId))
  );
  return savedSnapshot.docs.reduce<Record<string, SavedJob>>((acc, docSnap) => {
    const data = docSnap.data();
    acc[data.jobId] = data;
    return acc;
  }, {});
};

const JobCard: React.FC<{
  job: Job;
  saved?: boolean;
  onToggleSave: () => void;
  onOpenDetail: () => void;
}> = ({ job, saved, onToggleSave, onOpenDetail }) => {
  const isRemote = job.remoteType === 'remote';
  const salaryRange =
    job.salaryMin && job.salaryMax
      ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
      : job.salaryMin
      ? `${formatCurrency(job.salaryMin)}+`
      : undefined;

  return (
    <Card className="transition hover:border-primary/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">{job.orgId}</p>
                <h3 className="text-xl font-semibold">{job.title}</h3>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-4 w-4" /> {job.jobType.replace('_', ' ')}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> {formatRelativeTime(job.publishedAt ?? new Date())}
              </span>
              {isRemote && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                  Remote
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className={`rounded-full border p-2 transition ${
              saved ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'
            }`}
            onClick={onToggleSave}
            aria-label={saved ? 'Unsave job' : 'Save job'}
          >
            <Bookmark className="h-5 w-5" />
          </button>
        </div>

        {job.requirements && (
          <p className="mt-4 text-sm text-muted-foreground">{truncate(job.requirements, 200)}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {salaryRange && <span className="text-sm font-semibold">{salaryRange}</span>}
          <Button size="sm" variant="outline" onClick={onOpenDetail}>
            View details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<JobsFilterState>(defaultFilters);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);

  const jobsQuery = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
  });

  const savedJobsQuery = useQuery({
    queryKey: ['saved-jobs', user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => fetchSavedJobs(user!.id),
  });

  const toggleSaveMutation = useMutation({
    mutationKey: ['toggle-saved-job'],
    mutationFn: async ({ jobId, savedRecord }: { jobId: string; savedRecord?: SavedJob }) => {
      if (!user) {
        throw new Error('Sign in to save jobs');
      }
      if (savedRecord?.id) {
        await deleteDoc(doc(savedJobsCollection(), savedRecord.id));
        return;
      }
      await addDoc(savedJobsCollection(), {
        userId: user.id,
        jobId,
        createdAt: new Date(),
      } as Omit<SavedJob, 'id'>);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['saved-jobs', user.id] });
      }
      toast.success('Saved jobs updated');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update saved jobs';
      toast.error(message);
    },
  });

  const handleFilterChange = (
    field: keyof JobsFilterState,
    value: JobsFilterState[keyof JobsFilterState]
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  const jobs = jobsQuery.data ?? [];
  const savedJobs = savedJobsQuery.data ?? {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase text-primary tracking-widest">Jobs</p>
          <h1 className="text-3xl font-bold tracking-tight">Find your next opportunity</h1>
          <p className="text-muted-foreground">Search hundreds of curated roles from top companies.</p>
        </div>
        <Button variant="outline" onClick={clearFilters}>
          Reset filters
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription>Tune results to match your preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Job title or keyword"
                    value={filters.search}
                    onChange={(event) => handleFilterChange('search', event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="City or region"
                  value={filters.location}
                  onChange={(event) => handleFilterChange('location', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work type</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={filters.remoteType}
                  onChange={(event) => handleFilterChange('remoteType', event.target.value as JobsFilterState['remoteType'])}
                >
                  <option value="any">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job type</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={filters.jobType}
                  onChange={(event) => handleFilterChange('jobType', event.target.value as JobsFilterState['jobType'])}
                >
                  <option value="any">All types</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum salary (ZAR)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 35000"
                  value={filters.minSalary ?? ''}
                  onChange={(event) =>
                    handleFilterChange('minSalary', event.target.value ? Number(event.target.value) : undefined)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 space-y-4">
          {jobsQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : jobsQuery.isError ? (
            <Card>
              <CardContent className="py-16 text-center">
                <h3 className="text-lg font-semibold">Unable to load jobs</h3>
                <p className="text-sm text-muted-foreground">
                  Please refresh the page or try again later.
                </p>
              </CardContent>
            </Card>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Star className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No matches yet</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or broaden your search criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={Boolean(job.id && savedJobs[job.id])}
                onToggleSave={() =>
                  toggleSaveMutation.mutate({
                    jobId: job.id,
                    savedRecord: job.id ? savedJobs[job.id] : undefined,
                  })
                }
                onOpenDetail={() => setSelectedJob(job)}
              />
            ))
          )}
        </div>
      </div>

      <JobDetailDrawer
        job={selectedJob}
        saved={selectedJob ? Boolean(selectedJob.id && savedJobs[selectedJob.id]) : false}
        onClose={() => setSelectedJob(null)}
        onToggleSave={() => {
          if (!selectedJob) return;
          toggleSaveMutation.mutate({
            jobId: selectedJob.id,
            savedRecord: selectedJob.id ? savedJobs[selectedJob.id] : undefined,
          });
        }}
      />
    </div>
  );
};
