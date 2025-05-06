import { Document } from 'mongoose';
import { ICustomer } from './order.interface.js';

export type WMSStatus = 'pending' | 'processing' | 'picking' | 'packing' | 'shipped' | 'delivered' | 'cancelled' | 'error';

export interface ISyncHistory {
  status: WMSStatus;
  timestamp: Date;
  message: string;
}

export interface IInventoryUpdate {
  sku: string;
  quantity: number;
  timestamp: Date;
}

export interface IErrorLog {
  message: string;
  timestamp: Date;
  details: any;
}

export interface IWMS extends Document {
  orderId: string;
  wmsOrderId: string;
  status: WMSStatus;
  customer: ICustomer;
  lastSync: Date;
  syncHistory: ISyncHistory[];
  inventoryUpdates: IInventoryUpdate[];
  errorLog: IErrorLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWMSConnection {
  status: string;
  lastSync: string;
}

export interface IWMSResponse {
  success: boolean;
  message: string;
  connection?: IWMSConnection;
  wms_status?: WMSStatus;
  customer?: ICustomer;
}

export interface IOrderSyncRequest {
  orderId: string;
  orderData: {
    customer?: ICustomer;
    status?: WMSStatus;
  };
}

export interface ICustomerUpdateRequest {
  customerData: ICustomer;
}

export interface IInventoryUpdateRequest {
  sku: string;
  quantity: number;
} 