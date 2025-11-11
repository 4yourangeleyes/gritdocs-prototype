// Database and API types for Invoisity Backend

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  jurisdiction: Jurisdiction;
  is_vat_registered: boolean;
  subscription_tier: SubscriptionTier;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
  address_state?: string;
  tax_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: Date;
  due_date: Date;
  currency: Currency;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate?: number;
}

export interface ComplianceBlock {
  id: string;
  invoice_id: string;
  type: ComplianceBlockType;
  content: string;
  is_removable: boolean;
  jurisdiction: Jurisdiction;
}

export interface InvoiceNumberSequence {
  id: string;
  year: number;
  current_number: number;
  created_at: Date;
  updated_at: Date;
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

// API Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  jurisdiction: Jurisdiction;
}

export interface CreateInvoiceRequest {
  clientId: string;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }>;
  notes?: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  jurisdiction: Jurisdiction;
  subscriptionTier: SubscriptionTier;
  iat?: number;
  exp?: number;
}

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}