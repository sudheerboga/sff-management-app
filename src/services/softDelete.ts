import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { DeletedRecord } from '@/types';

function deletedCol(boutiqueId: string) {
  return collection(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.DELETED_RECORDS);
}

export async function softDelete(
  boutiqueId: string,
  collectionName: 'orders' | 'measurements',
  recordId: string,
  data: Record<string, unknown>,
  deletedBy: string,
  deletedByName: string,
): Promise<void> {
  await addDoc(deletedCol(boutiqueId), {
    boutiqueId,
    collection: collectionName,
    recordId,
    data,
    deletedBy,
    deletedByName,
    deletedAt: serverTimestamp(),
    isRestored: false,
  });
}

export async function getDeletedRecords(boutiqueId: string): Promise<DeletedRecord[]> {
  const q = query(deletedCol(boutiqueId), where('isRestored', '==', false));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const raw = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      boutiqueId: raw.boutiqueId as string,
      collection: raw.collection as DeletedRecord['collection'],
      recordId: raw.recordId as string,
      data: raw.data as Record<string, unknown>,
      deletedBy: raw.deletedBy as string,
      deletedByName: raw.deletedByName as string,
      deletedAt: raw.deletedAt instanceof Timestamp ? raw.deletedAt.toDate() : new Date(),
      isRestored: raw.isRestored as boolean || false,
    };
  });
}

export async function restoreRecord(
  boutiqueId: string,
  deletedRecordId: string,
  collectionName: 'orders' | 'measurements',
  recordId: string,
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, collectionName, recordId),
    { isDeleted: false },
  );
  await updateDoc(
    doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.DELETED_RECORDS, deletedRecordId),
    { isRestored: true },
  );
}

export async function permanentlyDelete(boutiqueId: string, deletedRecordId: string, collectionName: string, recordId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, collectionName, recordId));
  await deleteDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.DELETED_RECORDS, deletedRecordId));
}
