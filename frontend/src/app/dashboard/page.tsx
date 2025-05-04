'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns'; // Import date-fns for formatting

// Define an interface for the order structure
interface Order {
  id: string;
  orderNumber: string;
  customer: Customer | null;
  date: string;
  formattedDate: string;
  channel: string;
  total: string;
  note: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  items: Array<{ quantity: number }>;
  deliveryStatus: string;
  deliveryMethod: string;
  tags: string;
}

interface Customer {
  admin_graphql_api_id: string;
  created_at: string;
  currency: string;
  email: string;
  email_marketing_consent: {
    consent_updated_at: string | null;
    opt_in_level: string;
    state: string;
  };
  first_name: string | null;
  id: string;
  last_name: string | null;
  multipass_identifier: string | null;
  note: string | null;
  phone: string | null;
  sms_marketing_consent: {
    state: string;
  };
  tags: string;
  tax_exempt: boolean;
  tax_exemptions: string[];
  updated_at: string;
  verified_email: boolean;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]); // Use the Order interface
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error

  useEffect(() => {
    console.log(session, ": session data console");

    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Function to fetch orders (this now implicitly triggers backend sync via the API route)
  const fetchOrders = async () => {
    setIsLoading(true); // Set loading true when fetching starts
    let success = false; // Track success for handleSync
    try {
      // Fetch from the API endpoint that handles both fetching and backend sync
      const response = await axios.get('/api/shopify/orders');
      console.log(response.data, " : orders from /api/shopify/orders");

      if (response.data.success && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders.map((order: any): Order => ({ // Map to the Order interface
          id: order.id.toString(), // Ensure ID is string
          orderNumber: order.order_number || order.name?.replace('#', '') || `ID:${order.id}`, // Fallback if order_number is missing
          customer: order.customer,
          date: order.created_at, // Store original date
          formattedDate: order.created_at ? format(new Date(order.created_at), 'MMM d, h:mm a') : 'N/A',
          channel: order.source_name || 'Online Store',
          total: order.currency ? `¥${order.total_price}` : `$${order.total_price}`,
          paymentStatus: order.financial_status || 'Pending',
          note: order.note,
          fulfillmentStatus: order.fulfillment_status || 'Unfulfilled',
          items: order.line_items?.map((item: any) => ({ quantity: item.quantity })) || [],
          deliveryStatus: order.fulfillment_status === 'fulfilled' ? 'Shipped' : '',
          deliveryMethod: order.shipping_lines?.[0]?.title || 'Shipping',
          tags: order.tags || ''
        })));
        success = true; // Mark as successful
      } else {
        console.error('Error fetching orders: API response unsuccessful or invalid format', response.data?.error);
        setOrders([]); // Set to empty array on error
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      setOrders([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
    // Return success status so handleSync knows if it worked
    return success;
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders(); // Fetch orders when authenticated
    }
  }, [status]); // Rerun when status changes

  // Keep handleSync as is, or update it if needed for other actions
  const handleSync = async () => {
    setSyncStatus('syncing');
    const fetchSuccess = await fetchOrders(); // Call fetchOrders and get its success status

    if (fetchSuccess) {
      setSyncStatus('success'); // Set success if fetchOrders reported success
    } else {
      setSyncStatus('error'); // Set error if fetchOrders reported failure
    }

    // Reset status after a delay
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  // Filter orders based on active tab
  const filteredOrders = (() => {
    switch (activeTab) {
      case 'all':
        return orders;
      case 'unfulfilled':
        return orders.filter((order) => order.fulfillmentStatus === 'Unfulfilled' || order.fulfillmentStatus === null);
      case 'unpaid':
        // Include various pending/unpaid statuses
        const unpaidStatuses = ['pending', 'unpaid', 'partially_paid', 'authorized', 'voided'];
        return orders.filter((order) => unpaidStatuses.includes(order.paymentStatus.toLowerCase()));
      case 'open':
        // Open means not fulfilled OR not fully paid (excluding voided/refunded)
        const paidStatuses = ['paid', 'partially_refunded', 'refunded']; // Consider refunded as 'closed' for payment
        return orders.filter((order) =>
          (order.fulfillmentStatus !== 'fulfilled' && order.fulfillmentStatus !== 'cancelled') ||
          !paidStatuses.includes(order.paymentStatus.toLowerCase())
        );
      case 'archived':
        // Note: Shopify API might require specific query for archived orders.
        // This filter assumes 'archived' status might be present in tags or a specific field.
        // Adjust based on how you handle archived orders.
        return orders.filter((order: any) => order.status === 'Archived'); // Placeholder
      default:
        return orders;
    }
  })();

  if (status === 'loading' || isLoading) {
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
            <h1 className="text-xl font-bold text-indigo-600">WMS-PUSHER</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Add Inventory Link */}
            <Link href="/inventory" className="text-gray-600 hover:text-gray-900">
              Inventory
            </Link>
            <span className="text-sm text-gray-700">
              Welcome, {session?.user?.name || 'User'}
            </span>
            <Link href="/api/auth/signout" className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Orders</h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={handleSync} // This correctly calls the function above
              disabled={syncStatus === 'syncing'}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </>
              ) : 'Refresh Orders'}
            </button>
          </div>
        </div>

        {/* Sync Status Message */}
        {syncStatus === 'success' && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Successfully refreshed orders from Shopify!</p>
              </div>
            </div>
          </div>
        )}
        {syncStatus === 'error' && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Failed to refresh orders. Please check console for details.</p>
              </div>
            </div>
          </div>
        )}


        {/* Orders Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6 py-3">
              {/* Tab buttons */}
              {['all', 'unfulfilled', 'unpaid', 'open', 'archived'].map((tab) => (
                <button
                  key={tab}
                  className={`pb-3 px-1 capitalize ${activeTab === tab ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filter Controls (Optional - keep if needed) */}
          {/* ... existing search/filter controls ... */}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* ... existing headers ... */}
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date {/* Use the formatted date */}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment status
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fulfillment status
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery status
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery method
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => ( // Use the Order interface type
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-indigo-600">
                        <span className="relative group">
                          <Link href={`/orders/${order.id}`}>
                            {order.orderNumber}
                          </Link>
                          {order.note && (
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-pre-line">
                              {order.note}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {order.formattedDate} {/* Display formatted date */}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {order.customer
                          ? (
                            order.customer.first_name || order.customer.last_name
                              ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
                              : order.customer.email || 'No customer'
                          )
                          : 'No customer'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {order.channel}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {order.total}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 w-full flex text-center justify-center items-center py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.paymentStatus.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus.toLowerCase() === 'partially_refunded' ? 'bg-blue-100 text-blue-800' :
                              order.paymentStatus.toLowerCase() === 'refunded' ? 'bg-gray-100 text-gray-800' :
                                order.paymentStatus.toLowerCase() === 'voided' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'}`}>
                          {order.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.fulfillmentStatus?.toLowerCase() === 'fulfilled' ? 'bg-green-100 text-green-800' :
                            order.fulfillmentStatus?.toLowerCase() === 'partial' ? 'bg-blue-100 text-blue-800' :
                              order.fulfillmentStatus?.toLowerCase() === 'restocked' ? 'bg-gray-100 text-gray-800' : // Assuming restocked is a status
                                order.fulfillmentStatus === null ? 'bg-gray-100 text-gray-800' : // Handle null status
                                  'bg-yellow-100 text-yellow-800'}`}>
                          {order.fulfillmentStatus === null ? 'Unfulfilled' : order.fulfillmentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {order.items.reduce((total, item) => total + item.quantity, 0)} items
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {order.deliveryStatus}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {order.deliveryMethod}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {order.tags}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-4 py-4 text-center text-sm text-gray-500">
                      No orders found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}