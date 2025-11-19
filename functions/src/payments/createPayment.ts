import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const db = admin.firestore();
const PAYSTACK_SECRET_KEY = functions.config().paystack?.secret_key;

interface CreatePaymentRequest {
  orgId: string;
  planId: string;
  userId: string;
}

/**
 * Cloud Function to initiate a Paystack payment
 */
export const createPayment = functions.https.onCall(async (data: CreatePaymentRequest, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { orgId, planId, userId } = data;

  // Verify user is the owner of the organisation
  const orgDoc = await db.collection('organisations').doc(orgId).get();
  if (!orgDoc.exists || orgDoc.data()?.ownerUserId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'User does not own this organisation');
  }

  // Get plan details
  const planDoc = await db.collection('plans').doc(planId).get();
  if (!planDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Plan not found');
  }

  const plan = planDoc.data();
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();

  try {
    // Initialize Paystack transaction
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user?.email,
        amount: plan?.price * 100, // Paystack expects amount in kobo/cents
        currency: plan?.currency || 'ZAR',
        metadata: {
          orgId,
          planId,
          userId,
          planName: plan?.name,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { authorization_url, access_code, reference } = response.data.data;

    // Create a pending subscription record
    await db.collection('subscriptions').add({
      orgId,
      userId,
      planId,
      type: plan?.type,
      status: 'pending',
      paystackRef: reference,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      authorizationUrl: authorization_url,
      accessCode: access_code,
      reference,
    };
  } catch (error: unknown) {
    console.error('Paystack initialization error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to initialize payment';
    throw new functions.https.HttpsError('internal', message);
  }
});
