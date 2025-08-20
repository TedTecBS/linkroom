import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { z } from "zod"
import { createHash } from "crypto"

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

const ingestSchema = z.object({
  title: z.string(),
  description: z.string(),
  companyName: z.string().optional(),
  url: z.string().url(),
  expiresAt: z.string().datetime().optional(),
})

export const ingestJob = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed")
    return
  }

  const apiKey = req.get("INGEST_API_KEY")
  if (!apiKey || apiKey !== process.env.INGEST_API_KEY) {
    functions.logger.warn("Unauthorized ingest attempt")
    res.status(401).send("Unauthorized")
    return
  }

  try {
    const body = ingestSchema.parse(req.body)
    const id = createHash("sha1").update(body.url).digest("hex")
    const jobRef = db.collection("jobs").doc(id)
    const snap = await jobRef.get()
    const now = admin.firestore.Timestamp.now()
    const expiresAt = body.expiresAt
      ? admin.firestore.Timestamp.fromDate(new Date(body.expiresAt))
      : admin.firestore.Timestamp.fromMillis(Date.now() + 45 * 24 * 60 * 60 * 1000)

    const data: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      companyName: body.companyName ?? "Linkroom",
      url: body.url,
      expiresAt,
      isAdminPost: true,
      updatedAt: now,
    }

    if (!snap.exists) {
      Object.assign(data, {
        createdAt: now,
        hidden: false,
      })
    }

    await jobRef.set(data, { merge: true })
    functions.logger.info("Job ingested", { id })
    res.status(200).json({ id })
  } catch (err) {
    functions.logger.error("Ingest failed", err)
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) })
  }
})

export const expireJobs = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now()
    const cutoff = admin.firestore.Timestamp.fromMillis(
      Date.now() - 45 * 24 * 60 * 60 * 1000
    )

    const refs = new Map<string, admin.firestore.DocumentReference>()

    const createdSnap = await db
      .collection("jobs")
      .where("createdAt", "<", cutoff)
      .get()
    createdSnap.forEach((doc) => {
      if (!doc.get("hidden")) refs.set(doc.id, doc.ref)
    })

    const expiresSnap = await db
      .collection("jobs")
      .where("expiresAt", "<", now)
      .get()
    expiresSnap.forEach((doc) => {
      if (!doc.get("hidden")) refs.set(doc.id, doc.ref)
    })

    if (refs.size === 0) {
      functions.logger.info("No jobs to expire")
      return null
    }

    const batch = db.batch()
    refs.forEach((ref) => {
      batch.update(ref, { hidden: true, hiddenAt: now })
    })
    await batch.commit()
    functions.logger.info(`Expired ${refs.size} jobs`)
    return null
  })
