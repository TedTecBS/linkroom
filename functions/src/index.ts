import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { adminJobData, employerJobData, type JobInput } from './helpers'

admin.initializeApp()
const db = admin.firestore()

export const postAdminJob = functions.https.onCall(async (data: JobInput, context) => {
  if (context.auth?.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Must be admin')
  }
  const job = {
    ...adminJobData(data, context.auth.uid),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }
  await db.collection('jobs').add(job)
})

export const postEmployerJob = functions.https.onCall(
  async (data: JobInput, context) => {
    if (context.auth?.token.role !== 'employer') {
      throw new functions.https.HttpsError('permission-denied', 'Must be employer')
    }
    const userSnap = await db.collection('users').doc(context.auth.uid).get()
    const userData = userSnap.data() as { companyId: string }
    const companyRef = db.collection('companies').doc(userData.companyId)
    await db.runTransaction(async (tx) => {
      const company = await tx.get(companyRef)
      const tokens = company.data()?.tokensRemaining || 0
      if (tokens <= 0) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'No tokens remaining',
        )
      }
      tx.update(companyRef, { tokensRemaining: tokens - 1 })
      const job = {
        ...employerJobData(data, context.auth!.uid, userData.companyId),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }
      tx.create(db.collection('jobs').doc(), job)
    })
  },
)
