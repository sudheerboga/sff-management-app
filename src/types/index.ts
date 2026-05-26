export type UserRole = 'superAdmin' | 'admin' | 'staff';

export interface RefImage {
  url: string;
  publicId: string;
  note: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  folder: string;
}

export interface AuthUser {
  uid: string;
  phone?: string;
  email?: string;
  role: UserRole;
  boutiqueId?: string;
  boutiqueName?: string;
  name: string;
  cloudinary?: CloudinaryConfig;
}

export interface BoutiqueSubscription {
  plan: string;
  planName: string;
  expiresAt: Date | null;
  features: string[];
  isActive: boolean;
  maxOrders?: number;
  maxStaff?: number;
}

export interface BoutiqueBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

export interface Boutique {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  address?: string;
  gstin?: string;
  cloudinary?: CloudinaryConfig;
  status: 'active' | 'inactive' | 'suspended';
  subscription: BoutiqueSubscription;
  branding?: BoutiqueBranding;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoutiqueUser {
  uid: string;
  boutiqueId: string;
  name: string;
  phone: string;
  email?: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: Date;
}

export interface StaffInvite {
  phone: string;
  boutiqueId: string;
  role: 'admin' | 'staff';
  name: string;
  invitedBy: string;
  createdAt: Date;
}

// ─── Customer / Family model ───────────────────────────────────────────────
export type MemberRelation = 'self' | 'child' | 'spouse' | 'other';

export interface CustomerMember {
  id: string;
  name: string;
  relation: MemberRelation;
}

export interface Customer {
  id: string;
  boutiqueId: string;
  name: string;        // account holder name
  phone: string;       // unique per boutique — used for WhatsApp
  members: CustomerMember[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Returned by CustomerMemberPicker — carried into Order / Measurement
export interface CustomerPickResult {
  customerId: string;
  customerName: string;   // account holder
  customerPhone: string;
  memberName: string;     // who the order / measurement is for
  memberId?: string;
}

// ─── Orders ────────────────────────────────────────────────────────────────
export type OrderStatus = 'in-progress' | 'delivered';

export interface PaymentEntry {
  id: string;
  amount: number;
  date: Date;
  note: string;
  recordedBy: string;
  recordedById: string;
  recordedByRole: string;
}

export interface OrderItem {
  garment: string;
  description?: string;
  qty: number;
  rate: number;
  amount: number;
  profit: number;
  images?: RefImage[];
}

export interface Order {
  id: string;
  orderNumber: string;
  boutiqueId: string;
  customerId: string;     // ref to customers collection ('' for legacy orders)
  memberName: string;     // who this order is for (may differ from customerName)
  memberId?: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  totalProfit: number;
  materialCost: number;
  payments: PaymentEntry[];
  paidAmount: number;
  balanceAmount: number;
  status: OrderStatus;
  orderDate: Date;
  deliveryDate: Date | null;
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export type GarmentField = { label: string; value: string };

export interface CustomerMeasurements {
  [garmentType: string]: Record<string, string>;
}

export interface Measurement {
  id: string;
  boutiqueId: string;
  customerId: string;     // ref to customers collection ('' for legacy)
  memberName: string;     // who these measurements belong to
  memberId?: string;
  customerName: string;
  customerPhone: string;
  garments: CustomerMeasurements;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface MeasurementTemplate {
  id: string;
  boutiqueId: string;
  name: string;
  fields: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffMember {
  uid: string;
  boutiqueId: string;
  name: string;
  phone: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: Date;
}

export interface DeletedRecord {
  id: string;
  boutiqueId: string;
  collection: 'orders' | 'measurements';
  recordId: string;
  data: Record<string, unknown>;
  deletedBy: string;
  deletedByName: string;
  deletedAt: Date;
  isRestored: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string[];
  maxOrders: number;
  maxStaff: number;
  isActive: boolean;
}

export interface MonthlyMetric {
  month: string;
  revenue: number;
  orders: number;
  delivered: number;
}

export interface SuperAdmin {
  uid: string;
  email: string;
  name: string;
  createdAt: Date;
}
