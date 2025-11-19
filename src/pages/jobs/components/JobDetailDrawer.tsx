import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { getDoc } from 'firebase/firestore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, Bookmark, MapPin, Briefcase, Clock, Globe, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Job, JobSeekerProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';
import { functions } from '@/lib/firebase';
import { jobSeekerProfileDoc } from '@/lib/firestore-collections';

interface JobDetailDrawerProps {
  job: Job | null;
  saved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  saved,
  onClose,
  onToggleSave,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [coverLetter, setCoverLetter] = React.useState('');
  const [cvUrlOverride, setCvUrlOverride] = React.useState('');

  React.useEffect(() => {
    setCoverLetter('');
    setCvUrlOverride('');
  }, [job?.id]);

  const shouldLoadProfile = Boolean(job && user?.role === 'job_seeker');

  const profileQuery = useQuery({
    queryKey: ['job-seeker-profile', user?.id],
    enabled: shouldLoadProfile,
    queryFn: async () => {
      const snapshot = await getDoc(jobSeekerProfileDoc(user!.id));
      return snapshot.exists() ? (snapshot.data() as JobSeekerProfile) : null;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!job?.id) {
        throw new Error('Job is unavailable');
      }
      if (!user) {
        throw new Error('Sign in to apply');
      }
      const callable = httpsCallable(functions, 'applyForJob');
      await callable({
        jobId: job.id,
        coverLetter: coverLetter.trim() || undefined,
        cvUrlOverride: cvUrlOverride.trim() || undefined,
      });
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['job-applications', user.id] });
      }
      toast.success('Application submitted successfully');
      setCoverLetter('');
      setCvUrlOverride('');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to submit application';
      toast.error(message);
    },
  });

  const handleSubmitApplication = (event: React.FormEvent) => {
    event.preventDefault();
    applyMutation.mutate();
  };

  const promptSignIn = () => {
    navigate('/login', { state: { from: location } });
  };

  if (!job) {
    return null;
  }

  const salaryRange =
    job.salaryMin && job.salaryMax
      ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
      : job.salaryMin
      ? `${formatCurrency(job.salaryMin)}+`
      : undefined;

  const handleExternalApply = () => {
    if (job.applicationMethod === 'external' && job.externalUrl) {
      window.open(job.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    toast('Internal application flow coming soon.');
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex h-full w-full max-w-xl flex-col bg-background shadow-2xl">
        <header className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">{job.orgId}</p>
            <h2 className="text-2xl font-semibold">{job.title}</h2>
            <p className="text-sm text-muted-foreground">
              Posted {job.publishedAt ? formatRelativeTime(job.publishedAt) : 'recently'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={saved ? 'secondary' : 'outline'}
              size="icon"
              onClick={onToggleSave}
              aria-label={saved ? 'Remove saved job' : 'Save job'}
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close job details">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
              <span className="inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> {job.jobType.replace('_', ' ')}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {job.remoteType === 'remote' ? 'Remote' : job.remoteType === 'hybrid' ? 'Hybrid' : 'On-site'}
              </span>
              {job.externalUrl && (
                <span className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4" /> External application
                </span>
              )}
            </div>
            {salaryRange && <p className="text-base font-semibold text-foreground">{salaryRange}</p>}
          </div>

          <section className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold">Role overview</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {job.description}
            </p>
          </section>

          {job.requirements && (
            <section className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold">Requirements</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {job.requirements}
              </p>
            </section>
          )}

          {job.benefits && (
            <section className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold">Benefits</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {job.benefits}
              </p>
            </section>
          )}
        </div>

        <footer className="border-t px-6 py-6">
          {job.applicationMethod === 'external' ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                You will be redirected to the employer website to complete your application.
              </div>
              <Button onClick={handleExternalApply}>Apply on company site</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Apply directly on Linkroom</h3>
              {!user ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Sign in or create a job seeker account to submit your application.
                  </p>
                  <Button onClick={promptSignIn}>Sign in to apply</Button>
                </div>
              ) : user.role !== 'job_seeker' ? (
                <p className="text-sm text-muted-foreground">
                  You are currently signed in as an {user.role.replace('_', ' ')}. Switch to a job seeker
                  account to apply directly through Linkroom.
                </p>
              ) : profileQuery.isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmitApplication}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cover letter</label>
                    <Textarea
                      placeholder="Share why you're a great fit for this role (optional)"
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional but recommended. Keep it concise and highlight your strongest qualifications.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alternate CV link</label>
                    <Input
                      placeholder="Paste a shareable link to a PDF or document (optional)"
                      value={cvUrlOverride}
                      onChange={(event) => setCvUrlOverride(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Default CV:{' '}
                      {profileQuery.data?.cvFileName ? (
                        <>
                          {profileQuery.data.cvFileName}. You can update it in your{' '}
                          <Link className="text-primary underline" to="/dashboard/profile">
                            profile settings
                          </Link>
                          .
                        </>
                      ) : (
                        <>
                          No CV uploaded yet. Add one in your{' '}
                          <Link className="text-primary underline" to="/dashboard/profile">
                            profile settings
                          </Link>
                          .
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      We send your profile and CV directly to the employer. You can track updates in “My
                      applications”.
                    </p>
                    <Button type="submit" disabled={applyMutation.isPending}>
                      {applyMutation.isPending ? 'Submitting...' : 'Submit application'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </footer>
      </aside>
    </div>
  );
};
