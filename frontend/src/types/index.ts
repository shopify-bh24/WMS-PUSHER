// Order Types
export interface Order {
  id: string;
  customer: string;
  date: string;
  status: OrderStatus;
  items: number;
  total: string;
}

export interface OrderDetail {
  id: string;
  customer: Customer;
  shipping: ShippingAddress;
  items: OrderItem[];
  payment: PaymentInfo;
  dates: OrderDates;
  status: OrderStatus;
  notes: string;
  wmsStatus: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: string;
  total: string;
}

export interface PaymentInfo {
  method: string;
  status: string;
  total: string;
  subtotal: string;
  shipping: string;
  tax: string;
}

export interface OrderDates {
  created: string;
  updated: string;
  shipped: string | null;
  delivered: string | null;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

// WMS Types
export interface WMSConnection {
  status: 'connected' | 'disconnected';
  lastSync: string;
}

export interface InventoryItem {
  sku: string;
  name: string;
  quantity: number;
  location: string;
}

export interface WMSUpdate {
  orderId: string;
  status: string;
  updatedAt: string;
}

export interface WMSData {
  connection: WMSConnection;
  inventory: InventoryItem[];
  pendingUpdates: WMSUpdate[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}