import { doc, getDoc } from 'firebase/firestore'
import { db } from '../integrations/firebase'

export const getTokensRemaining = async (companyId: string) => {
  const snap = await getDoc(doc(db, 'companies', companyId))
  return (snap.data()?.tokensRemaining as number) ?? 0
}
