import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Cloud Functions
export { createPayment } from './payments/createPayment';
export { verifyPayment } from './payments/verifyPayment';
export { applyForJob } from './applications/applyForJob';
export { withdrawApplication } from './applications/withdrawApplication';
export { trackJobView } from './jobs/trackJobView';
export { sendJobAlerts } from './jobs/sendJobAlerts';

// Example: Health check endpoint
export const healthCheck = functions.https.onRequest((request, response) => {
  response.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
});
