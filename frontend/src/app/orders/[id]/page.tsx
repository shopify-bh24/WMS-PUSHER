'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

// Mock order data for demonstration
const mockOrderDetails = {
  id: 'SHO12345',
  customer: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  },
  shipping: {
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  },
  items: [
    { id: 1, name: 'T-Shirt (Blue, Large)', sku: 'PROD-001-BL-L', quantity: 2, price: '$29.99', total: '$59.98' },
    { id: 2, name: 'Jeans (Black, 32x32)', sku: 'PROD-002-BK-32', quantity: 1, price: '$69.99', total: '$69.99' },
  ],
  payment: {
    method: 'Credit Card',
    status: 'Paid',
    total: '$129.97',
    subtotal: '$129.97',
    shipping: '$0.00',
    tax: '$0.00',
  },
  dates: {
    created: '2025-04-15T14:30:00Z',
    updated: '2025-04-15T15:45:00Z',
    shipped: null,
    delivered: null,
  },
  status: 'Processing',
  notes: '',
  wmsStatus: 'Picking',
};

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(mockOrderDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState(mockOrderDetails.notes);
  const [updateMessage, setUpdateMessage] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/shopify/orders/${params!.id}`);
        const shopifyOrder = response.data.order;

        setOrder({
          id: shopifyOrder.id,
          customer: {
            name: `${shopifyOrder.customer?.first_name} ${shopifyOrder.customer?.last_name}`,
            email: shopifyOrder.email,
            phone: shopifyOrder.phone || 'N/A',
          },
          shipping: {
            address: shopifyOrder.shipping_address?.address1,
            city: shopifyOrder.shipping_address?.city,
            state: shopifyOrder.shipping_address?.province_code,
            zipCode: shopifyOrder.shipping_address?.zip,
            country: shopifyOrder.shipping_address?.country_name,
          },
          items: shopifyOrder.line_items.map((item: any) => ({
            id: item.id,
            name: item.title,
            sku: item.sku,
            quantity: item.quantity,
            price: `$${item.price}`,
            total: `$${(item.quantity * item.price).toFixed(2)}`
          })),
          payment: {
            method: shopifyOrder.payment_gateway_names?.[0] || 'N/A',
            status: shopifyOrder.financial_status,
            total: `$${shopifyOrder.total_price}`,
            subtotal: `$${shopifyOrder.subtotal_price}`,
            shipping: `$${shopifyOrder.total_shipping_price_set?.presentment_money.amount || '0.00'}`,
            tax: `$${shopifyOrder.total_tax || '0.00'}`
          },
          dates: {
            created: shopifyOrder.created_at,
            updated: shopifyOrder.updated_at,
            shipped: shopifyOrder.fulfillments?.[0]?.created_at,
            delivered: null
          },
          status: shopifyOrder.fulfillment_status || 'pending',
          notes: shopifyOrder.note,
          wmsStatus: shopifyOrder.tags?.includes('wms_processed') ? 'Processed' : 'Pending'
        });
      } catch (err) {
        setError('Failed to fetch order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params!.id]);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      // Simulate API call to update order status
      // In a real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local state
      setOrder(prev => ({ ...prev, status: newStatus }));
      setUpdateMessage({
        type: 'success',
        message: `Order status updated to ${newStatus}`
      });
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        message: 'Failed to update order status'
      });
    } finally {
      setIsUpdating(false);
      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage({ type: '', message: '' }), 3000);
    }
  };

  const handleNotesUpdate = async () => {
    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      // Simulate API call to update order notes
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setOrder(prev => ({ ...prev, notes }));
      setUpdateMessage({
        type: 'success',
        message: 'Order notes updated successfully'
      });
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        message: 'Failed to update order notes'
      });
    } finally {
      setIsUpdating(false);
      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage({ type: '', message: '' }), 3000);
    }
  };

  const syncWithWMS = async () => {
    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });
    try {
      const response = await axios.post(`/api/wms/sync/${params!.id}`);

      setUpdateMessage({
        type: 'success',
        message: response.data.message || 'Order synchronized with WMS successfully'
      });

      // Update local state with WMS status if needed
      setOrder(prev => ({
        ...prev,
        wmsStatus: response.data.wms_status
      }));
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        message: 'Failed to synchronize with WMS'
      });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setUpdateMessage({ type: '', message: '' }), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-indigo-600">Shopify-WMS Integration</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/api/auth/signout" className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mr-4">
                Order {order.id}
              </h2>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : ''}
                ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${order.status === 'Pending' ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Created on {new Date(order.dates.created).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={syncWithWMS}
              disabled={isUpdating}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Syncing...' : 'Sync with WMS'}
            </button>
          </div>
        </div>

        {/* Status Update Message */}
        {updateMessage.message && (
          <div className={`mb-6 p-4 border-l-4 ${updateMessage.type === 'success' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {updateMessage.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${updateMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {updateMessage.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Order Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Information</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Order Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleStatusUpdate}
                        disabled={isUpdating || newStatus === order.status}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Update
                      </button>
                    </div>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">WMS Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.wmsStatus}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.payment.status}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.payment.method}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(order.dates.created).toLocaleString()}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(order.dates.updated).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Information</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.customer.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.customer.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.customer.phone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.shipping.address}<br />
                    {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}<br />
                    {order.shipping.country}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Subtotal</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.payment.subtotal}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Shipping</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.payment.shipping}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tax</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.payment.tax}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.payment.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Order Notes */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order Notes</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="mt-1">
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="shadow-sm text-[#000] focus:ring-indigo-500 block w-full sm:text-sm border border-[#000] p-5 rounded-md outline-none"
                placeholder="Add notes about this order..."
              />
            </div>
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={handleNotesUpdate}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}