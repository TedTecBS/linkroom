import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface TrackJobViewRequest {
  jobId: string;
}

/**
 * Cloud Function to track job views
 */
export const trackJobView = functions.https.onCall(async (data: TrackJobViewRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { jobId } = data;

  try {
    await db
      .collection('jobs')
      .doc(jobId)
      .update({
        viewCount: admin.firestore.FieldValue.increment(1),
      });

    return { success: true };
  } catch (error) {
    console.error('Error tracking job view:', error);
    throw new functions.https.HttpsError('internal', 'Failed to track view');
  }
});
