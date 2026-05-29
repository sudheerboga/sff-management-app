import { useState } from 'react';
import {
  collection, doc, writeBatch, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';

// ─── Fake data pools ────────────────────────────────────────────────────────

const FEMALE_NAMES = [
  'Priya Sharma', 'Ananya Patel', 'Kavya Reddy', 'Deepa Nair', 'Sunita Joshi',
  'Meena Iyer', 'Lakshmi Venkat', 'Pooja Gupta', 'Rekha Sinha', 'Usha Pillai',
  'Divya Rao', 'Shalini Mehta', 'Aarti Bose', 'Geeta Kulkarni', 'Nandini Das',
  'Saranya Kumar', 'Preeti Verma', 'Bhavana Singh', 'Manjula Hegde', 'Radha Krishnan',
  'Kamala Naidu', 'Vaishnavi Patil', 'Shobha Yadav', 'Malathi Subramanian', 'Hema Chatterjee',
  'Sneha Desai', 'Padma Nambiar', 'Sumathi Rajan', 'Chitra Prasad', 'Anitha Menon',
  'Lalitha Murthy', 'Savitha Bhat', 'Jayanthi Shetty', 'Vasantha Pillai', 'Rohini Mishra',
  'Mythili Krishnaswamy', 'Indira Ramachandran', 'Saraswathi Gopal', 'Vijayalakshmi Nair', 'Kalpana Tiwari',
];

const CHILD_NAMES = [
  'Shruti', 'Aditi', 'Diya', 'Kriti', 'Ishaan', 'Arjun', 'Rohan', 'Aryan',
  'Nisha', 'Sanya', 'Meghna', 'Tanvi', 'Riya', 'Simran', 'Anika',
];

const GARMENTS = ['Blouse', 'Salwar', 'Churidar', 'Kurti', 'Lehenga', 'Saree Blouse', 'Pavadai', 'Half Saree'];

const MEASUREMENT_FIELDS: Record<string, Record<string, string>> = {
  Blouse: { Bust: '36', Waist: '30', Hip: '38', Length: '16', 'Sleeve Length': '22', Shoulder: '14', 'Neck Depth': '6' },
  Salwar: { Hip: '38', Waist: '30', Length: '40', 'Bottom Width': '14', 'Crotch Depth': '11' },
  Churidar: { Hip: '38', Waist: '30', Length: '38', 'Bottom Width': '8', 'Crotch Depth': '11' },
  Kurti: { Bust: '36', Waist: '30', Hip: '38', Length: '42', Shoulder: '14', 'Sleeve Length': '8' },
  Lehenga: { Hip: '38', Waist: '30', Length: '42', 'Blouse Bust': '36', 'Blouse Length': '14' },
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

function generatePhone(index: number): string {
  return `98${String(10000000 + index).slice(1)}`;
}

function jitter(base: string, range = 3): string {
  return String(parseInt(base) + randomInt(-range, range));
}

// ─── Seed functions ──────────────────────────────────────────────────────────

async function seedData(
  boutiqueId: string,
  boutiqueName: string,
  adminUid: string,
  adminName: string,
  customerCount: number,
  onProgress: (msg: string) => void,
) {
  const customersCol  = collection(db, 'boutiques', boutiqueId, 'customers');
  const ordersCol     = collection(db, 'boutiques', boutiqueId, 'orders');
  const measureCol    = collection(db, 'boutiques', boutiqueId, 'measurements');

  let totalOrders = 0;
  let totalMeasurements = 0;

  const namePool = [...FEMALE_NAMES].sort(() => Math.random() - 0.5).slice(0, customerCount);

  for (let ci = 0; ci < customerCount; ci++) {
    const customerName = namePool[ci] || `Customer ${ci + 1}`;
    const phone = generatePhone(ci + 1000);

    // Build members list
    const members: { id: string; name: string; relation: string }[] = [
      { id: `m-${ci}-0`, name: customerName, relation: 'self' },
    ];
    const extraMembers = randomInt(0, 2);
    for (let mi = 0; mi < extraMembers; mi++) {
      const relation = mi === 0 ? (Math.random() > 0.5 ? 'spouse' : 'child') : 'child';
      const childName = randomFrom(CHILD_NAMES);
      members.push({ id: `m-${ci}-${mi + 1}`, name: childName, relation });
    }

    // Write customer
    const customerRef = doc(customersCol);
    const batch1 = writeBatch(db);
    batch1.set(customerRef, {
      boutiqueId,
      name: customerName,
      phone,
      members,
      notes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await batch1.commit();

    onProgress(`Creating customer ${ci + 1}/${customerCount}: ${customerName}`);

    // Orders for this customer
    const orderCount = randomInt(3, 15);
    let batch = writeBatch(db);
    let batchCount = 0;

    for (let oi = 0; oi < orderCount; oi++) {
      const member = randomFrom(members);
      const garment = randomFrom(GARMENTS);
      const qty = randomInt(1, 3);
      const rate = randomInt(600, 5000);
      const amount = qty * rate;
      const materialCost = Math.round(amount * 0.3);
      const paidAmount = randomFrom([0, Math.round(amount * 0.5), amount]);
      const balanceAmount = amount - paidAmount;
      const orderDaysAgo = randomInt(1, 180);
      const orderDate = daysAgo(orderDaysAgo);
      const deliveryDaysFromOrder = randomInt(5, 30);
      const deliveryDate = new Date(orderDate.getTime() + deliveryDaysFromOrder * 86_400_000);
      const isDelivered = deliveryDate < new Date() && Math.random() > 0.4;

      const suffix = Date.now().toString(36).slice(-5).toUpperCase() + oi;
      const initials = boutiqueName.split(' ').map((w) => w[0]).join('').slice(0, 4) || 'ORD';

      const orderRef = doc(ordersCol);
      batch.set(orderRef, {
        orderNumber: `${initials}-${suffix}`,
        boutiqueId,
        customerId: customerRef.id,
        memberName: member.name,
        memberId: member.id,
        customerName,
        customerPhone: phone,
        items: [{ garment, qty, rate, amount, profit: amount - materialCost, images: [] }],
        totalAmount: amount,
        totalProfit: amount - materialCost,
        materialCost,
        payments: paidAmount > 0 ? [{
          id: `p-${oi}`,
          amount: paidAmount,
          date: Timestamp.fromDate(orderDate),
          note: 'Advance',
          recordedBy: adminName,
          recordedById: adminUid,
          recordedByRole: 'admin',
        }] : [],
        paidAmount,
        balanceAmount,
        status: isDelivered ? 'delivered' : 'in-progress',
        orderDate: Timestamp.fromDate(orderDate),
        deliveryDate: Timestamp.fromDate(deliveryDate),
        notes: '',
        createdBy: adminUid,
        createdByName: adminName,
        createdAt: Timestamp.fromDate(orderDate),
        updatedAt: Timestamp.fromDate(orderDate),
        isDeleted: false,
      });

      batchCount++;
      totalOrders++;

      if (batchCount === 490) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    // Measurements for each member
    for (const member of members) {
      const garmentTypes = [randomFrom(Object.keys(MEASUREMENT_FIELDS)), randomFrom(Object.keys(MEASUREMENT_FIELDS))];
      const unique = [...new Set(garmentTypes)];
      const garments: Record<string, Record<string, string>> = {};
      for (const g of unique) {
        const base = MEASUREMENT_FIELDS[g] ?? {};
        garments[g] = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, jitter(v)]));
      }

      const measureRef = doc(measureCol);
      batch.set(measureRef, {
        boutiqueId,
        customerId: customerRef.id,
        memberName: member.name,
        memberId: member.id,
        customerName,
        customerPhone: phone,
        garments,
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isDeleted: false,
      });
      batchCount++;
      totalMeasurements++;

      if (batchCount === 490) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }
  }

  return { totalOrders, totalMeasurements };
}

// ─── UI ──────────────────────────────────────────────────────────────────────

const SCALES = [
  { label: 'Small',  count: 10,  desc: '~10 customers · ~80 orders · ~20 measurements' },
  { label: 'Medium', count: 30,  desc: '~30 customers · ~250 orders · ~60 measurements' },
  { label: 'Large',  count: 80,  desc: '~80 customers · ~700 orders · ~160 measurements' },
];

export default function SeedPage() {
  const user = useAuthStore((s) => s.user);
  const [scale, setScale] = useState(1);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState<{ orders: number; measurements: number } | null>(null);

  // Super admins don't have a boutiqueId — let them type one manually
  const [manualBoutiqueId, setManualBoutiqueId] = useState('');
  const boutiqueId   = user?.boutiqueId || manualBoutiqueId.trim();
  const boutiqueName = user?.boutiqueName || 'Boutique';
  const adminUid     = user?.uid  || 'seed-script';
  const adminName    = user?.name || 'Seed Script';

  async function handleSeed() {
    if (!boutiqueId) { alert('Enter a Boutique ID'); return; }
    setRunning(true);
    setLog([]);
    setDone(null);

    try {
      const result = await seedData(
        boutiqueId,
        boutiqueName,
        adminUid,
        adminName,
        SCALES[scale].count,
        (msg) => setLog((prev) => [...prev.slice(-20), msg]),
      );
      setDone({ orders: result.totalOrders, measurements: result.totalMeasurements });
      setLog((prev) => [...prev, `✓ Done — ${result.totalOrders} orders, ${result.totalMeasurements} measurements created.`]);
    } catch (e) {
      setLog((prev) => [...prev, `✗ Error: ${(e as Error).message}`]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px', fontFamily: 'monospace' }}>
      <h2 style={{ fontSize: 20, marginBottom: 4 }}>🌱 Dev Seed</h2>

      {user?.boutiqueId ? (
        <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
          Boutique: <strong>{boutiqueName}</strong> ({boutiqueId})
        </p>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
            Paste the <strong>Boutique ID</strong> from Firebase Console → Firestore → boutiques collection:
          </p>
          <input
            type="text"
            value={manualBoutiqueId}
            onChange={(e) => setManualBoutiqueId(e.target.value)}
            placeholder="e.g. xK9mP2qRnTuV..."
            style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1.5px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {SCALES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setScale(i)}
            disabled={running}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 8,
              border: `2px solid ${scale === i ? '#7B5EA7' : '#ddd'}`,
              background: scale === i ? '#f3eeff' : '#fff',
              cursor: 'pointer', fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>{s.desc}</div>
          </button>
        ))}
      </div>

      <button
        onClick={handleSeed}
        disabled={running || !boutiqueId}
        style={{
          width: '100%', padding: '13px', borderRadius: 8,
          background: running ? '#e0e0e0' : '#7B5EA7',
          color: running ? '#999' : '#fff',
          border: 'none', fontSize: 15, fontWeight: 700,
          cursor: running ? 'not-allowed' : 'pointer',
          marginBottom: 20,
        }}
      >
        {running ? 'Seeding…' : `Seed ${SCALES[scale].label} Dataset`}
      </button>

      {done && (
        <div style={{ padding: 14, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          ✅ Created <strong>{done.orders} orders</strong> and <strong>{done.measurements} measurements</strong> — refresh the app to see them.
        </div>
      )}

      {log.length > 0 && (
        <div style={{ background: '#111', color: '#0f0', borderRadius: 8, padding: '12px 14px', fontSize: 12, maxHeight: 260, overflowY: 'auto', lineHeight: 1.7 }}>
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </div>
  );
}
