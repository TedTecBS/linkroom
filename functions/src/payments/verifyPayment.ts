import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const db = admin.firestore();
const PAYSTACK_SECRET_KEY = functions.config().paystack?.secret_key;

interface PaystackVerifyResponse {
  status: boolean;
  data: {
    status: string;
    metadata: PaystackTransactionMetadata;
  };
}

interface PaystackTransactionMetadata {
  planId: string;
  [key: string]: unknown;
}

type SubscriptionUpdate = {
  status: 'active';
  lastPaymentStatus: 'success';
  startedAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  expiresAt?: admin.firestore.Timestamp;
  remainingJobCredits?: number;
};

interface VerifyPaymentRequest {
  reference: string;
}

/**
 * Cloud Function to verify a Paystack payment
 */
export const verifyPayment = functions.https.onCall(async (data: VerifyPaymentRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { reference } = data;

  try {
    // Verify transaction with Paystack
    const response = await axios.get<PaystackVerifyResponse>(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data: txData } = response.data;

    if (status && txData.status === 'success') {
      const { metadata } = txData;

      // Find subscription with this reference
      const subsSnapshot = await db
        .collection('subscriptions')
        .where('paystackRef', '==', reference)
        .limit(1)
        .get();

      if (subsSnapshot.empty) {
        throw new functions.https.HttpsError('not-found', 'Subscription not found');
      }

      const subsDoc = subsSnapshot.docs[0];
      const plan = await db.collection('plans').doc(metadata.planId).get();
      const planData = plan.data();

      const now = admin.firestore.Timestamp.now();
      const updateData: SubscriptionUpdate = {
        status: 'active',
        lastPaymentStatus: 'success',
        startedAt: now,
        updatedAt: now,
      };

      // Set expiry for subscriptions
      if (planData?.type === 'subscription' && planData.durationMonths) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + planData.durationMonths);
        updateData.expiresAt = admin.firestore.Timestamp.fromDate(expiryDate);
      }

      // Set remaining credits for bundles or single jobs
      if (planData?.jobCredits) {
        updateData.remainingJobCredits = planData.jobCredits;
      }

      await subsDoc.ref.update(updateData);

      return {
        success: true,
        subscription: {
          id: subsDoc.id,
          ...updateData,
        },
      };
    } else {
      throw new functions.https.HttpsError('failed-precondition', 'Payment verification failed');
    }
  } catch (error: unknown) {
    console.error('Payment verification error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to verify payment';
    throw new functions.https.HttpsError('internal', message);
  }
});
