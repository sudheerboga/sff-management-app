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

export type OrderStatus = 'pending' | 'in-progress' | 'ready' | 'delivered' | 'cancelled';

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
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  totalProfit: number;
  materialCost: number;
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
  customerName: string;
  customerPhone: string;
  garments: CustomerMeasurements;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface BillItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export type PaymentStatus = 'paid' | 'partial' | 'pending';

export interface Bill {
  id: string;
  boutiqueId: string;
  orderId?: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: BillItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  isDeleted: boolean;
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
  collection: 'orders' | 'measurements' | 'billing';
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
