import {
  collection,
  doc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  WithFieldValue,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  User,
  JobSeekerProfile,
  Organisation,
  Job,
  Application,
  Plan,
  Subscription,
  Alert,
  AdminLog,
  SavedJob,
  ExperienceItem,
  EducationItem,
} from '@/types';

type FirestoreExperienceItem = Omit<ExperienceItem, 'startDate' | 'endDate'> & {
  startDate: Timestamp | Date;
  endDate?: Timestamp | Date | null;
};

type FirestoreEducationItem = Omit<EducationItem, 'startDate' | 'endDate'> & {
  startDate: Timestamp | Date;
  endDate?: Timestamp | Date | null;
};

const isExperienceList = (value: unknown): value is ExperienceItem[] =>
  Array.isArray(value);

const isEducationList = (value: unknown): value is EducationItem[] =>
  Array.isArray(value);

// ==========================================
// FIRESTORE CONVERTERS
// ==========================================
// These converters ensure type-safe reads/writes to Firestore

// Helper to convert Firestore Timestamps to Dates
const timestampToDate = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Helper to convert Dates to Firestore Timestamps
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Generic converter creator
const createConverter = <T extends DocumentData>(
  toFirestoreTransform?: (data: WithFieldValue<T>) => DocumentData,
  fromFirestoreTransform?: (data: DocumentData) => T
): FirestoreDataConverter<T> => {
  return {
    toFirestore: (data: WithFieldValue<T>): DocumentData => {
      if (toFirestoreTransform) {
        return toFirestoreTransform(data);
      }
      return data as DocumentData;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot): T => {
      const data = snapshot.data();
      if (fromFirestoreTransform) {
        return fromFirestoreTransform({ id: snapshot.id, ...data });
      }
      return { id: snapshot.id, ...data } as unknown as T;
    },
  };
};

// User converter
export const userConverter = createConverter<User>(
  (user) => ({
    ...user,
    createdAt: user.createdAt ? dateToTimestamp(user.createdAt as Date) : Timestamp.now(),
    updatedAt: dateToTimestamp(new Date()),
  }),
  (data) => ({
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as User)
);

// Job Seeker Profile converter
export const jobSeekerProfileConverter = createConverter<JobSeekerProfile>(
  (profile) => ({
    ...profile,
    experience: isExperienceList(profile.experience)
      ? profile.experience.map((exp) => ({
          ...exp,
          startDate: dateToTimestamp(exp.startDate as Date),
          endDate: exp.endDate ? dateToTimestamp(exp.endDate as Date) : null,
        }))
      : profile.experience,
    education: isEducationList(profile.education)
      ? profile.education.map((edu) => ({
          ...edu,
          startDate: dateToTimestamp(edu.startDate as Date),
          endDate: edu.endDate ? dateToTimestamp(edu.endDate as Date) : null,
        }))
      : profile.education,
    createdAt: profile.createdAt ? dateToTimestamp(profile.createdAt as Date) : Timestamp.now(),
    updatedAt: dateToTimestamp(new Date()),
  }),
  (data) => ({
    ...data,
    experience: data.experience?.map((exp: FirestoreExperienceItem) => ({
      ...exp,
      startDate: timestampToDate(exp.startDate),
      endDate: exp.endDate ? timestampToDate(exp.endDate) : undefined,
    })),
    education: data.education?.map((edu: FirestoreEducationItem) => ({
      ...edu,
      startDate: timestampToDate(edu.startDate),
      endDate: edu.endDate ? timestampToDate(edu.endDate) : undefined,
    })),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as JobSeekerProfile)
);

// Organisation converter
export const organisationConverter = createConverter<Organisation>(
  (org) => ({
    ...org,
    createdAt: org.createdAt ? dateToTimestamp(org.createdAt as Date) : Timestamp.now(),
    updatedAt: dateToTimestamp(new Date()),
  }),
  (data) => ({
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Organisation)
);

// Job converter
export const jobConverter = createConverter<Job>(
  (job) => ({
    ...job,
    publishedAt: job.publishedAt ? dateToTimestamp(job.publishedAt as Date) : null,
    expiresAt: job.expiresAt ? dateToTimestamp(job.expiresAt as Date) : null,
    createdAt: job.createdAt ? dateToTimestamp(job.createdAt as Date) : Timestamp.now(),
    updatedAt: dateToTimestamp(new Date()),
  }),
  (data) => ({
    ...data,
    publishedAt: data.publishedAt ? timestampToDate(data.publishedAt) : undefined,
    expiresAt: data.expiresAt ? timestampToDate(data.expiresAt) : undefined,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Job)
);

// Application converter
export const applicationConverter = createConverter<Application>(
  (app) => ({
    ...app,
    createdAt: app.createdAt ? dateToTimestamp(app.createdAt as Date) : Timestamp.now(),
    updatedAt: dateToTimestamp(new Date()),
  }),
  (data) => ({
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Application)
);

// Plan converter
export const planConverter = createConverter<Plan>();

// Subscription converter
export const subscriptionConverter = createConverter<Subscription>(
  (sub) => ({
    ...sub,
    startedAt: dateToTimestamp(sub.startedAt as Date),
    expiresAt: sub.expiresAt ? dateToTimestamp(sub.expiresAt as Date) : null,
    createdAt: sub.createdAt ? dateToTimestamp(sub.createdAt as Date) : Timestamp.now(),
    updatedAt: dateToTimestamp(new Date()),
  }),
  (data) => ({
    ...data,
    startedAt: timestampToDate(data.startedAt),
    expiresAt: data.expiresAt ? timestampToDate(data.expiresAt) : undefined,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Subscription)
);

// Alert converter
export const alertConverter = createConverter<Alert>(
  (alert) => ({
    ...alert,
    lastSentAt: alert.lastSentAt ? dateToTimestamp(alert.lastSentAt as Date) : null,
    createdAt: alert.createdAt ? dateToTimestamp(alert.createdAt as Date) : Timestamp.now(),
    updatedAt: dateToTimestamp(new Date()),
  }),
  (data) => ({
    ...data,
    lastSentAt: data.lastSentAt ? timestampToDate(data.lastSentAt) : undefined,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Alert)
);

// Admin Log converter
export const adminLogConverter = createConverter<AdminLog>(
  (log) => ({
    ...log,
    createdAt: log.createdAt ? dateToTimestamp(log.createdAt as Date) : Timestamp.now(),
  }),
  (data) => ({
    ...data,
    createdAt: timestampToDate(data.createdAt),
  } as AdminLog)
);

// Saved Job converter
export const savedJobConverter = createConverter<SavedJob>(
  (saved) => ({
    ...saved,
    createdAt: saved.createdAt ? dateToTimestamp(saved.createdAt as Date) : Timestamp.now(),
  }),
  (data) => ({
    ...data,
    createdAt: timestampToDate(data.createdAt),
  } as SavedJob)
);

// ==========================================
// COLLECTION REFERENCES
// ==========================================

export const usersCollection = () =>
  collection(db, 'users').withConverter(userConverter);

export const jobSeekerProfilesCollection = () =>
  collection(db, 'job_seeker_profiles').withConverter(jobSeekerProfileConverter);

export const organisationsCollection = () =>
  collection(db, 'organisations').withConverter(organisationConverter);

export const jobsCollection = () =>
  collection(db, 'jobs').withConverter(jobConverter);

export const applicationsCollection = () =>
  collection(db, 'applications').withConverter(applicationConverter);

export const plansCollection = () =>
  collection(db, 'plans').withConverter(planConverter);

export const subscriptionsCollection = () =>
  collection(db, 'subscriptions').withConverter(subscriptionConverter);

export const alertsCollection = () =>
  collection(db, 'alerts').withConverter(alertConverter);

export const adminLogsCollection = () =>
  collection(db, 'admin_logs').withConverter(adminLogConverter);

export const savedJobsCollection = () =>
  collection(db, 'saved_jobs').withConverter(savedJobConverter);

// ==========================================
// DOCUMENT REFERENCES
// ==========================================

export const userDoc = (userId: string) =>
  doc(usersCollection(), userId);

export const jobSeekerProfileDoc = (profileId: string) =>
  doc(jobSeekerProfilesCollection(), profileId);

export const organisationDoc = (orgId: string) =>
  doc(organisationsCollection(), orgId);

export const jobDoc = (jobId: string) =>
  doc(jobsCollection(), jobId);

export const applicationDoc = (applicationId: string) =>
  doc(applicationsCollection(), applicationId);

export const planDoc = (planId: string) =>
  doc(plansCollection(), planId);

export const subscriptionDoc = (subscriptionId: string) =>
  doc(subscriptionsCollection(), subscriptionId);

export const alertDoc = (alertId: string) =>
  doc(alertsCollection(), alertId);

export const adminLogDoc = (logId: string) =>
  doc(adminLogsCollection(), logId);

export const savedJobDoc = (savedJobId: string) =>
  doc(savedJobsCollection(), savedJobId);
