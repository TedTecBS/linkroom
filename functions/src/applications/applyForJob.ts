import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface ApplyForJobRequest {
  jobId: string;
  coverLetter?: string;
  cvUrlOverride?: string;
}

/**
 * Cloud Function to handle job applications
 */
export const applyForJob = functions.https.onCall(async (data: ApplyForJobRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { jobId, coverLetter, cvUrlOverride } = data;
  const userId = context.auth.uid;

  // Verify user is a job seeker
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();

  if (!user || user.role !== 'job_seeker') {
    throw new functions.https.HttpsError('permission-denied', 'Only job seekers can apply');
  }

  // Get job details
  const jobDoc = await db.collection('jobs').doc(jobId).get();
  if (!jobDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Job not found');
  }

  const job = jobDoc.data();
  if (job?.status !== 'published') {
    throw new functions.https.HttpsError('failed-precondition', 'Job is not accepting applications');
  }

  // Check if user already applied
  const existingApplication = await db
    .collection('applications')
    .where('jobId', '==', jobId)
    .where('applicantUserId', '==', userId)
    .limit(1)
    .get();

  if (!existingApplication.empty) {
    throw new functions.https.HttpsError('already-exists', 'You have already applied for this job');
  }

  // Create application
  const application = await db.collection('applications').add({
    jobId,
    orgId: job?.orgId,
    applicantUserId: userId,
    status: 'submitted',
    coverLetter: coverLetter || '',
    cvUrlOverride: cvUrlOverride || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    applicationId: application.id,
  };
});
