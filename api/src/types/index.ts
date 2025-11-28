import { Request } from 'express';

// Extend Express Request interface for authenticated requests
export interface AuthenticatedRequest extends Request {
  userId: string;
}

// User-related types
export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginAttributes {
  username: string;
  password: string;
}

export interface UserResponseAttributes {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Medical Provider types
export interface MedicalProviderAttributes {
  id: string;
  userId: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  paymentWebsite?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicalProviderCreationAttributes {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  paymentWebsite?: string;
}

// Medical Bill types
export interface MedicalBillAttributes {
  id: string;
  userId: string;
  medicalProviderId: string;
  dateOfService: Date;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicalBillCreationAttributes {
  medicalProviderId: string;
  dateOfService: Date;
  total: number;
}

// Medical Bill Charges types
export interface MedicalBillChargesAttributes {
  id: string;
  medicalBillId: string;
  amount: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicalBillChargesCreationAttributes {
  medicalBillId: string;
  amount: number;
  description?: string;
}

// Explanation of Benefits types
export interface ExplanationOfBenefitsAttributes {
  id: string;
  userId: string;
  medicalProviderId: string;
  dateOfService: Date;
  totalPaid: number;
  totalBilled: number;
  totalDiscount: number;
  totalMayOwe: number;
  insurer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExplanationOfBenefitsCreationAttributes {
  medicalProviderId: string;
  dateOfService: Date;
  totalPaid: number;
  totalBilled: number;
  totalDiscount: number;
  totalMayOwe: number;
  insurer: string;
}

// Collection Bill types
export interface CollectionBillAttributes {
  id: string;
  userId: string;
  medicalProviderId: string;
  dateOfNotice: Date;
  dateOfService: Date;
  amountTotal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CollectionBillCreationAttributes {
  medicalProviderId: string;
  dateOfNotice: Date;
  dateOfService: Date;
  amountTotal: number;
}

// Medical Bill Service Event junction types
export interface MedicalBillServiceEventAttributes {
  id: string;
  medicalBillId: string;
  medicalServiceEventId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Medical Service Event types
export interface MedicalServiceEventAttributes {
  id: string;
  userId: string;
  medicalProviderId: string;
  explanationOfBenefitsId?: string;
  dateOfService: Date;
  description?: string;
  amount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicalServiceEventCreationAttributes {
  medicalProviderId: string;
  explanationOfBenefitsId?: string;
  dateOfService: Date;
  description?: string;
  amount?: number;
}

// Medical Bill Payments types
export interface MedicalBillPaymentsAttributes {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicalBillPaymentsCreationAttributes {
  amount: number;
  date: Date;
  notes?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

// Session types
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}