import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDocs,
  getDoc,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Loader2, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '@/features/auth/useAuth';
import {
  applicationsCollection,
  jobDoc,
} from '@/lib/firestore-collections';
import { Application, ApplicationStatus, Job } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { functions } from '@/lib/firebase';

type ApplicationListItem = Application & {
  job?: Job;
};

const fetchUserApplications = async (userId: string): Promise<ApplicationListItem[]> => {
  const applicationsQuery = query(
    applicationsCollection(),
    where('applicantUserId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(applicationsQuery);
  const entries = snapshot.docs.map((docSnap) => docSnap.data());

  const jobIds = Array.from(new Set(entries.map((entry) => entry.jobId)));
  const jobDocs = await Promise.all(jobIds.map((id) => getDoc(jobDoc(id))));
  const jobMap: Record<string, Job> = {};
  jobDocs.forEach((docSnap) => {
    if (docSnap.exists()) {
      jobMap[docSnap.id] = docSnap.data();
    }
  });

  return entries.map((entry) => ({
    ...entry,
    job: jobMap[entry.jobId],
  }));
};

const STATUS_META: Record<ApplicationStatus, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  viewed: { label: 'Viewed', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  shortlisted: { label: 'Shortlisted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  hired: { label: 'Offer Accepted', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  withdrawn: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const WITHDRAWABLE_STATUSES: ApplicationStatus[] = ['submitted', 'viewed', 'shortlisted'];

export const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ['job-applications', user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => fetchUserApplications(user!.id),
  });

  const withdrawMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const callable = httpsCallable(functions, 'withdrawApplication');
      await callable({ applicationId });
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['job-applications', user.id] });
      }
      toast.success('Application withdrawn');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to withdraw application';
      toast.error(message);
    },
  });

  const applications = React.useMemo(
    () => applicationsQuery.data ?? [],
    [applicationsQuery.data]
  );

  const summary = React.useMemo(() => {
    const total = applications.length;
    const interviewing = applications.filter((app) =>
      ['viewed', 'shortlisted'].includes(app.status)
    ).length;
    const offers = applications.filter((app) => app.status === 'hired').length;
    const rejected = applications.filter((app) => app.status === 'rejected').length;
    return { total, interviewing, offers, rejected };
  }, [applications]);

  const isLoading = applicationsQuery.isLoading;
  const isError = applicationsQuery.isError;

  const handleWithdraw = (applicationId: string) => {
    withdrawMutation.mutate(applicationId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">
          Track application progress, follow up with employers, or withdraw submissions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">In progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.interviewing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.offers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm text-muted-foreground">
                Unable to load applications right now. Please try again shortly.
              </p>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You have not submitted any applications yet.
              </p>
            </div>
          ) : (
            applications.map((application) => {
              const meta = STATUS_META[application.status];
              const job = application.job;
              const withdrawable = WITHDRAWABLE_STATUSES.includes(application.status);

              return (
                <div
                  key={application.id}
                  className="rounded-md border p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Applied {formatRelativeTime(application.createdAt)}
                      </p>
                      <h3 className="text-xl font-semibold">
                        {job?.title ?? 'Job no longer available'}
                      </h3>
                      {job && (
                        <p className="text-sm text-muted-foreground">
                          {job.location} · {job.jobType.replace('_', ' ')}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {application.coverLetter && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      “{application.coverLetter.slice(0, 160)}
                      {application.coverLetter.length > 160 ? '…' : ''}”
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {job?.slug ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={`/jobs/${job.slug}`} target="_blank" rel="noreferrer">
                          View job <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Job unavailable
                      </Button>
                    )}
                    {withdrawable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWithdraw(application.id)}
                        disabled={withdrawMutation.isPending}
                      >
                        Withdraw application
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};
