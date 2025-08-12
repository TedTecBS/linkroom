import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

admin.initializeApp()
const db = admin.firestore()

type JobInput = {
  title: string
  description: string
  companyName?: string
}

export const postJob = functions.https.onCall(async (data: JobInput, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required")
  }
  const uid = context.auth.uid
  const userRef = db.collection("users").doc(uid)
  const snap = await userRef.get()
  if (!snap.exists) {
    throw new functions.https.HttpsError("failed-precondition", "User profile missing")
  }
  const user = snap.data() as { role?: string; tokens?: number }
  if (user.role !== "company") {
    throw new functions.https.HttpsError("permission-denied", "Company role required")
  }
  const tokens = user.tokens ?? 0
  if (tokens <= 0) {
    throw new functions.https.HttpsError("resource-exhausted", "No tokens left")
  }

  const { title, description, companyName } = data
  if (!title || !description) {
    throw new functions.https.HttpsError("invalid-argument", "Missing fields")
  }

  const batch = db.batch()
  const jobRef = db.collection("jobs").doc()
  batch.set(jobRef, {
    title,
    description,
    companyName: companyName ?? "Unnamed Company",
    createdBy: uid,
    isAdminPost: false,        // company posts are ad-free
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })
  batch.update(userRef, { tokens: tokens - 1 })
  await batch.commit()

  return { id: jobRef.id }
})

export const adminPostJob = functions.https.onCall(async (data: JobInput, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required")
  }
  const uid = context.auth.uid
  const userRef = db.collection("users").doc(uid)
  const snap = await userRef.get()
  const user = snap.exists ? snap.data() : null
  if (!user || user.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Admin role required")
  }

  const { title, description, companyName } = data
  if (!title || !description) {
    throw new functions.https.HttpsError("invalid-argument", "Missing fields")
  }

  const jobRef = await db.collection("jobs").add({
    title,
    description,
    companyName: companyName ?? "Linkroom",
    createdBy: uid,
    isAdminPost: true,        // admin posts include ads
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })

  return { id: jobRef.id }
})
