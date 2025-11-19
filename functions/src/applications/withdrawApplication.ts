import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface WithdrawApplicationRequest {
  applicationId: string;
}

const WITHDRAWABLE_STATUSES = new Set(['submitted', 'viewed', 'shortlisted']);

export const withdrawApplication = functions.https.onCall(
  async (data: WithdrawApplicationRequest, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated.'
      );
    }

    const { applicationId } = data || {};

    if (!applicationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Application ID is required.'
      );
    }

    const userId = context.auth.uid;
    const applicationRef = db.collection('applications').doc(applicationId);
    const applicationSnap = await applicationRef.get();

    if (!applicationSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Application not found.');
    }

    const application = applicationSnap.data();

    if (!application || application.applicantUserId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You can only withdraw your own applications.'
      );
    }

    if (application.status === 'withdrawn') {
      return { success: true, status: 'withdrawn' };
    }

    if (!WITHDRAWABLE_STATUSES.has(application.status)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This application can no longer be withdrawn.'
      );
    }

    await applicationRef.update({
      status: 'withdrawn',
      withdrawnAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, status: 'withdrawn' };
  }
);
