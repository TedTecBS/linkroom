import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Scheduled function to send job alerts
 * Runs daily at 9 AM
 */
export const sendJobAlerts = functions.pubsub.schedule('0 9 * * *').onRun(async () => {
  console.log('Starting job alerts process...');

  // Get all active alerts
  const alertsSnapshot = await db.collection('alerts').where('isActive', '==', true).get();

  for (const alertDoc of alertsSnapshot.docs) {
    const alert = alertDoc.data();
    const { userId, criteria, frequency, lastSentAt } = alert;

    // Check if alert should be sent based on frequency
    const now = new Date();
    const lastSent = lastSentAt?.toDate();

    if (frequency === 'daily') {
      // Send daily alerts
      if (lastSent && now.getTime() - lastSent.getTime() < 24 * 60 * 60 * 1000) {
        continue; // Skip if sent in last 24 hours
      }
    } else if (frequency === 'weekly') {
      // Send weekly alerts
      if (lastSent && now.getTime() - lastSent.getTime() < 7 * 24 * 60 * 60 * 1000) {
        continue; // Skip if sent in last 7 days
      }
    }

    // Build query based on criteria
    let query: admin.firestore.Query = db.collection('jobs').where('status', '==', 'published');

    if (criteria.jobType) {
      query = query.where('jobType', '==', criteria.jobType);
    }

    if (criteria.remoteType) {
      query = query.where('remoteType', '==', criteria.remoteType);
    }

    // Execute query
    const jobsSnapshot = await query.get();
    const matchingJobs = jobsSnapshot.docs;

    if (matchingJobs.length > 0) {
      // TODO: Send email notification with matching jobs
      console.log(`Found ${matchingJobs.length} matching jobs for user ${userId}`);

      // Update lastSentAt
      await alertDoc.ref.update({
        lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  console.log('Job alerts process completed');
  return null;
});
