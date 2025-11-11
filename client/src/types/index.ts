// Core application types for Invoisity PWA

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jurisdiction: Jurisdiction;
  isVatRegistered: boolean;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  lineItems: LineItem[];
  notes?: string;
  complianceBlocks: ComplianceBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
}

export interface ComplianceBlock {
  id: string;
  type: ComplianceBlockType;
  content: string;
  isRemovable: boolean;
  jurisdiction: Jurisdiction;
}

export enum Jurisdiction {
  FRANCE = 'FR',
  SOUTH_AFRICA = 'SA'
}

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export enum Currency {
  EUR = 'EUR',
  ZAR = 'ZAR'
}

export enum ComplianceBlockType {
  VAT_EXEMPTION = 'vat_exemption',
  DISCLAIMER = 'disclaimer',
  TERMS = 'terms',
  FOOTER = 'footer'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  jurisdiction: Jurisdiction;
}

export interface InvoiceForm {
  clientId: string;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  lineItems: Omit<LineItem, 'id' | 'totalPrice'>[];
  notes?: string;
}

// UI State types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}