import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { MeasurementTemplate } from '@/types';

function templatesCol(boutiqueId: string) {
  return collection(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.MEASUREMENT_TEMPLATES);
}

function fromFirestore(id: string, data: Record<string, unknown>): MeasurementTemplate {
  return {
    id,
    boutiqueId: (data.boutiqueId as string) || '',
    name: (data.name as string) || '',
    fields: (data.fields as string[]) || [],
    order: (data.order as number) ?? 0,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

export async function getMeasurementTemplates(boutiqueId: string): Promise<MeasurementTemplate[]> {
  const q = query(templatesCol(boutiqueId), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
}

export async function createMeasurementTemplate(
  boutiqueId: string,
  data: { name: string; fields: string[]; order: number },
): Promise<string> {
  const ref = await addDoc(templatesCol(boutiqueId), {
    boutiqueId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMeasurementTemplate(
  boutiqueId: string,
  templateId: string,
  data: { name?: string; fields?: string[]; order?: number },
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.MEASUREMENT_TEMPLATES, templateId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMeasurementTemplate(boutiqueId: string, templateId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.MEASUREMENT_TEMPLATES, templateId));
}
