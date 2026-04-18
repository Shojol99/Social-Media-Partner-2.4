export type OrderStatus = 'pending' | 'approved' | 'rejected';

export interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  transactionId: string;
  status: OrderStatus;
  createdAt: number;
  approvedAt?: number;
  driveAccess?: boolean;
  emailSent?: boolean;
  uid?: string;
}

export interface Product {
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
}

export interface ContactReport {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
}
