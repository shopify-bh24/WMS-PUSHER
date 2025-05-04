'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

// Define a more detailed type for the order state
interface OrderItem {
  id: string | number;
  name: string;
  sku: string;
  quantity: number;
  price: string; // Formatted price with currency
  total: string; // Formatted total with currency
  image_url?: string; // Add image URL if available
  variant_title?: string; // e.g., "XS / S / Black"
}

interface OrderState {
  id: string;
  order_number: string; // Shopify order number like #1001
  created_at: string;
  source: string; // e.g., "from Draft Orders"
  payment_status: string; // e.g., "Payment pending"
  fulfillment_status: string | null; // e.g., "Unfulfilled"
  currency: string; // e.g., "JPY"
  items: OrderItem[];
  subtotal: string; // Formatted
  taxes: string; // Formatted
  shipping_cost: string; // Formatted shipping cost << ADDED
  total: string; // Formatted
  paid: string; // Formatted amount paid
  balance: string; // Formatted balance due
  delivery_method: string; // e.g., "Shipping"
  notes: string | null;
  customer: {
    id?: number;
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
  };
  shipping_address: {
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
  };
  billing_address: { // Add billing address
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
  };
  // Placeholder for data not yet fetched/implemented
  timeline: any[];
  conversion_summary: any;
  order_risk: any;
  tags: string[];
  wmsStatus?: string; // Add optional wmsStatus << ADDED
}

interface EditableCustomer {
  name: string;
  email: string;
  phone: string;
  shipping_address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billing_address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Initial state structure matching the image more closely
const initialOrderState: OrderState = {
  id: '',
  order_number: '',
  created_at: '',
  source: '',
  payment_status: 'pending',
  fulfillment_status: null,
  currency: 'USD', // Default currency, will be updated
  items: [],
  subtotal: '¥0',
  taxes: '¥0',
  shipping_cost: '¥0', // Initialize shipping cost << ADDED
  total: '¥0',
  paid: '¥0',
  balance: '¥0',
  delivery_method: 'Shipping', // Assuming default
  notes: null,
  customer: {
    id: undefined,
    admin_graphql_api_id: '',
    created_at: new Date().toISOString(),
    currency: 'USD',
    email: '',
    email_marketing_consent: {
      consent_updated_at: null,
      opt_in_level: 'single_opt_in',
      state: 'not_subscribed'
    },
    first_name: null,
    last_name: null,
    multipass_identifier: null,
    note: null,
    phone: null,
    sms_marketing_consent: {
      state: 'not_subscribed'
    },
    tags: '',
    tax_exempt: false,
    tax_exemptions: [],
    updated_at: new Date().toISOString(),
    verified_email: false
  },
  shipping_address: { address: null, city: null, state: null, zipCode: null, country: null },
  billing_address: { address: null, city: null, state: null, zipCode: null, country: null },
  timeline: [],
  conversion_summary: null,
  order_risk: null,
  tags: [],
  wmsStatus: 'Unknown', // Initialize WMS status << ADDED
};


export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderState>(initialOrderState);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const [editableNotes, setEditableNotes] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState({ type: '', message: '' });
  const [error, setError] = useState('');

  const [editableCustomer, setEditableCustomer] = useState<EditableCustomer>({
    name: '',
    email: '',
    phone: '',
    shipping_address: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    billing_address: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(`/api/shopify/orders/${params!.id}`);
        const shopifyOrder = response.data.order;
        console.log(shopifyOrder, " : Shopify Order response");

        if (!shopifyOrder) {
          throw new Error('Order data not found in API response');
        }

        console.log(shopifyOrder, " : Shopify Order response");

        const formatCurrency = (amount: string | number | undefined | null, currencyCode: string): string => {
          if (amount === undefined || amount === null) amount = 0;
          const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
          const options: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: currencyCode,
          };
          if (currencyCode === '¥') {
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
          } else {
            options.minimumFractionDigits = 2;
            options.maximumFractionDigits = 2;
          }
          return new Intl.NumberFormat(undefined, options).format(numberAmount);
        };

        const currencyCode = shopifyOrder.currency || 'USD';

        const totalAmount = parseFloat(shopifyOrder.total_price || '0');

        const currentFulfillmentStatus = shopifyOrder.fulfillment_status || 'unfulfilled';

        const paidAmount = shopifyOrder.financial_status === 'paid' ? totalAmount : 0;
        const balanceAmount = totalAmount - paidAmount;

        setOrder({
          id: shopifyOrder.id.toString(),
          order_number: `#${shopifyOrder.order_number}`,
          created_at: shopifyOrder.created_at,
          source: shopifyOrder.source_name === 'draft_order' ? 'from Draft Orders' : 'from Draft Orders',
          payment_status: shopifyOrder.financial_status,
          fulfillment_status: currentFulfillmentStatus,
          currency: currencyCode,
          items: shopifyOrder.line_items.map((item: any) => ({
            id: item.id,
            name: item.title,
            sku: item.sku || 'N/A',
            quantity: item.quantity,
            price: formatCurrency(item.price, currencyCode),
            total: formatCurrency(item.quantity * parseFloat(item.price), currencyCode),
            variant_title: item.variant_title,
            image_url: item.image?.src || undefined,
          })),
          subtotal: formatCurrency(shopifyOrder.subtotal_price, currencyCode),
          taxes: formatCurrency(shopifyOrder.total_tax, currencyCode),
          // Extract and format shipping cost (check API response structure for the correct field)
          shipping_cost: formatCurrency(shopifyOrder.total_shipping_price_set?.shop_money?.amount, currencyCode), // << MODIFIED/ADDED
          total: formatCurrency(shopifyOrder.total_price, currencyCode),
          paid: formatCurrency(paidAmount, currencyCode),
          balance: formatCurrency(balanceAmount, currencyCode),
          // Delivery method might be in shipping lines
          delivery_method: shopifyOrder.shipping_lines?.[0]?.title || 'Shipping',
          notes: shopifyOrder.note || null,
          customer: {
            admin_graphql_api_id: shopifyOrder.customer?.admin_graphql_api_id || '',
            email: shopifyOrder.customer?.email || '',
            phone: shopifyOrder.customer?.phone || null,
            first_name: shopifyOrder.customer?.first_name || null,
            last_name: shopifyOrder.customer?.last_name || null,
            note: shopifyOrder.customer?.note || null,
            tags: shopifyOrder.customer?.tags || '',
            verified_email: shopifyOrder.customer?.verified_email || false,
            created_at: shopifyOrder.customer?.created_at || '',
            updated_at: shopifyOrder.customer?.updated_at || '',
            currency: shopifyOrder.customer?.currency || '',
            email_marketing_consent: {
              consent_updated_at: shopifyOrder.customer?.email_marketing_consent?.consent_updated_at || null,
              opt_in_level: shopifyOrder.customer?.email_marketing_consent?.opt_in_level || '',
              state: shopifyOrder.customer?.email_marketing_consent?.state || ''
            },
            sms_marketing_consent: {
              state: shopifyOrder.customer?.sms_marketing_consent?.state || ''
            },
            tax_exempt: shopifyOrder.customer?.tax_exempt || false,
            tax_exemptions: shopifyOrder.customer?.tax_exemptions || [],
            multipass_identifier: shopifyOrder.customer?.multipass_identifier || null
          },
          shipping_address: {
            address: shopifyOrder.shipping_address?.address1 || null,
            city: shopifyOrder.shipping_address?.city || null,
            state: shopifyOrder.shipping_address?.province_code || null,
            zipCode: shopifyOrder.shipping_address?.zip || null,
            country: shopifyOrder.shipping_address?.country || null, // Use 'country' field
          },
          // Map billing address
          billing_address: {
            address: shopifyOrder.billing_address?.address1 || null,
            city: shopifyOrder.billing_address?.city || null,
            state: shopifyOrder.billing_address?.province_code || null,
            zipCode: shopifyOrder.billing_address?.zip || null,
            country: shopifyOrder.billing_address?.country || null,
          },
          // Initialize placeholders - these need separate implementation
          timeline: [],
          conversion_summary: null, // Needs specific data/logic
          order_risk: null, // Needs specific data/logic (Order Risk API)
          tags: shopifyOrder.tags ? shopifyOrder.tags.split(',').map((t: string) => t.trim()) : [],
        });

        // Initialize selectedStatus and editableNotes
        setSelectedStatus(currentFulfillmentStatus);
        setEditableNotes(shopifyOrder.note || ''); // Initialize with fetched notes or empty string

      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(`Failed to fetch order details: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) { // Ensure ID exists before fetching
      fetchOrder();
    } else {
      setError('Order ID is missing.');
      setIsLoading(false);
    }
  }, [params?.id]);

  // Add useEffect to initialize editableCustomer when order data is loaded
  useEffect(() => {
    if (order.customer) {
      setEditableCustomer({
        name: `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 'No customer',
        email: order.customer.email || '',
        phone: order.customer.phone || '',
        shipping_address: {
          address: order.shipping_address.address || '',
          city: order.shipping_address.city || '',
          state: order.shipping_address.state || '',
          zipCode: order.shipping_address.zipCode || '',
          country: order.shipping_address.country || ''
        },
        billing_address: {
          address: order.billing_address.address || '',
          city: order.billing_address.city || '',
          state: order.billing_address.state || '',
          zipCode: order.billing_address.zipCode || '',
          country: order.billing_address.country || ''
        }
      });
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      // First update Shopify via API
      const shopifyResponse = await axios.post(`/api/shopify/sync`, {
        orderId: params!.id,
        action: 'update_status',
        status: selectedStatus
      });

      // Then update the database
      await axios.put(`/api/orders/${params!.id}`, {
        fulfillment_status: selectedStatus,
        shopify_order_id: params!.id
      });

      // Update local state
      setOrder(prev => ({ ...prev, fulfillment_status: selectedStatus }));

      setUpdateMessage({
        type: 'success',
        message: `Order status updated to ${selectedStatus}`
      });
    } catch (error: any) {
      console.error('Failed to update status:', error);
      setUpdateMessage({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update order status'
      });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setUpdateMessage({ type: '', message: '' }), 3000);
    }
  };

  const handleNotesUpdate = async () => {
    if (editableNotes === order.notes) {
      setUpdateMessage({ type: 'info', message: 'Notes have not changed.' });
      setTimeout(() => setUpdateMessage({ type: '', message: '' }), 3000);
      return;
    }

    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      // Update Shopify via API
      await axios.post(`/api/shopify/sync`, {
        orderId: params!.id,
        action: 'update_notes',
        notes: editableNotes
      });

      // Update database
      await axios.put(`/api/orders/${params!.id}`, {
        notes: editableNotes,
        shopify_order_id: params!.id
      });

      // Update local state
      setOrder(prev => ({ ...prev, notes: editableNotes }));

      setUpdateMessage({
        type: 'success',
        message: 'Order notes updated successfully'
      });
    } catch (error: any) {
      console.error('Failed to update notes:', error);
      setUpdateMessage({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update order notes'
      });
    } finally {
      setIsUpdating(false);
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

  // Add function to handle customer updates
  const handleCustomerUpdate = async () => {
    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      // First update Shopify via API
      await axios.post(`/api/shopify/sync`, {
        orderId: params!.id,
        action: 'update_customer',
        customer: {
          name: editableCustomer.name,
          email: editableCustomer.email,
          phone: editableCustomer.phone,
          shipping_address: editableCustomer.shipping_address,
          billing_address: editableCustomer.billing_address
        }
      });

      // Then update the database
      await axios.put(`/api/orders/${params!.id}`, {
        customer: {
          name: editableCustomer.name,
          email: editableCustomer.email,
          phone: editableCustomer.phone
        },
        shipping_address: editableCustomer.shipping_address,
        billing_address: editableCustomer.billing_address,
        shopify_order_id: params!.id
      });

      // Update local state
      setOrder(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          name: editableCustomer.name,
          email: editableCustomer.email,
          phone: editableCustomer.phone
        },
        shipping_address: editableCustomer.shipping_address,
        billing_address: editableCustomer.billing_address
      }));

      setUpdateMessage({
        type: 'success',
        message: 'Customer information updated successfully'
      });
    } catch (error: any) {
      console.error('Failed to update customer:', error);
      setUpdateMessage({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update customer information'
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

  // Helper function to render status badges (Example)
  const renderStatusBadge = (text: string, color: 'yellow' | 'green' | 'blue' | 'gray') => {
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[color]}`}>{text}</span>;
  };


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header remains the same */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-indigo-600">WMS-PUSHER</h1>
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
      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Header Section (Updated) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {order.order_number}
              </h2>
              {/* Payment Status Badge */}
              {order.payment_status && renderStatusBadge(
                order.payment_status === 'pending' ? 'Payment pending' : order.payment_status,
                order.payment_status === 'paid' ? 'green' : 'yellow' // Adjust logic as needed
              )}
              {/* Fulfillment Status Badge */}
              {renderStatusBadge(
                order.fulfillment_status || 'Unfulfilled',
                order.fulfillment_status === 'fulfilled' ? 'green' : 'yellow'
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString()} {order.source && `from ${order.source}`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            {/* Unfulfilled Items Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Unfulfilled ({order.items.length}) {/* Total items count since fulfillment status not tracked yet */}
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <p className="text-sm text-gray-500">Delivery method: {order.delivery_method}</p>
                {/* Item List */}
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    {/* Item Image Placeholder */}
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover rounded" />
                      ) : (
                        <svg className="h-6 w-6 text-gray-400" /* Placeholder icon */ >...</svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-600 hover:underline cursor-pointer">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.variant_title}</p> {/* Display variant */}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.price} x {item.quantity}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{item.total}</div>
                  </div>
                ))}
                {/* Fulfill Button */}
                {/* <div className="flex justify-end pt-4">
                  <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Fulfill items
                  </button>
                </div> */}
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                {/* Payment Status Badge */}
                {order.payment_status && renderStatusBadge(
                  order.payment_status === 'pending' ? 'Payment pending' : order.payment_status,
                  order.payment_status === 'paid' ? 'green' : 'yellow' // Adjust logic as needed
                )}
              </div>
              <div className="p-4 sm:p-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{order.items.reduce((total, item) => total + item.quantity, 0)} items</span>
                  <span className="text-gray-900">{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes</span>
                  <span className="text-gray-500">CT 10%</span> {/* Adjust tax display */}
                  <span className="text-gray-900">{order.taxes}</span>
                </div>
                {/* Add Shipping if applicable */}
                {parseFloat(order.shipping_cost.replace(/[^0-9.-]+/g, "")) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">{order.shipping_cost}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{order.total}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid</span>
                  <span className="text-gray-900">{order.paid}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Balance</span>
                  <span className="text-gray-900">{order.balance}</span>
                </div>
                {/* Action Buttons */}
                {/* <div className="flex justify-end space-x-2 pt-4">
                  <button className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Send invoice</button>
                  <button className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900">Mark as paid</button>
                </div> */}
              </div>
            </div>

            {/* Timeline Card */}
            {/* <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Timeline</h3>
              </div> */}
            {/* <div className="p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">IM</div> Placeholder Initials */}
            {/* <div className="min-w-0 flex-1">
                    <textarea
                      rows={3}
                      className="block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Leave a comment..."
                      value={editableNotes || ''}
                      onChange={(e) => setEditableNotes(e.target.value)}
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <div></div>
                      <button
                        onClick={handleNotesUpdate}
                        disabled={isUpdating}
                        className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        {isUpdating ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div> */}
            {/* </div>
                <p className="mt-4 text-center text-xs text-gray-500">Only you and other staff can see comments</p>
              </div> */}
            {/* </div> */}

          </div> {/* End Left Column */}

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 space-y-6">

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-3 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Notes</h3>
                {!isEditingNotes && (
                  <button
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="p-4 sm:p-6 text-sm text-gray-500">
                {isEditingNotes ? (
                  <div>
                    <textarea
                      className="w-full border rounded p-2"
                      value={editableNotes || ""}
                      onChange={e => setEditableNotes(e.target.value)}
                    />
                    <div className="mt-2 flex space-x-2">
                      <button
                        className="px-3 py-1 bg-indigo-600 text-white rounded"
                        onClick={async () => {
                          await handleNotesUpdate();
                          await handleStatusUpdate();
                          setIsEditingNotes(false);
                        }}
                        disabled={isUpdating}
                      >
                        Save
                      </button>
                      <button
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                        onClick={() => setIsEditingNotes(false)}
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <span>{order.notes ? order.notes : "No notes from customer"}</span>
                )}
              </div>
            </div>

            {/* Customer Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-3 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Customer</h3>
                <button
                  onClick={async () => {
                    await handleCustomerUpdate();
                    await handleStatusUpdate();
                  }}
                  disabled={isUpdating}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editableCustomer.name}
                    onChange={(e) => setEditableCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                {/* Contact Info */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Contact information</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={editableCustomer.email}
                        onChange={(e) => setEditableCustomer(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={editableCustomer.phone}
                        onChange={(e) => setEditableCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                </div>
                {/* Shipping Address */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping address</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        value={editableCustomer.shipping_address.address}
                        onChange={(e) => setEditableCustomer(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, address: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={editableCustomer.shipping_address.city}
                          onChange={(e) => setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, city: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          value={editableCustomer.shipping_address.state}
                          onChange={(e) => setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, state: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                          type="text"
                          value={editableCustomer.shipping_address.zipCode}
                          onChange={(e) => setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, zipCode: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          value={editableCustomer.shipping_address.country}
                          onChange={(e) => setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, country: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {order.billing_address.address && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Billing address</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                          type="text"
                          value={editableCustomer.billing_address.address}
                          onChange={(e) => setEditableCustomer(prev => ({
                            ...prev,
                            billing_address: { ...prev.billing_address, address: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            value={editableCustomer.billing_address.city}
                            onChange={(e) => setEditableCustomer(prev => ({
                              ...prev,
                              billing_address: { ...prev.billing_address, city: e.target.value }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            value={editableCustomer.billing_address.state}
                            onChange={(e) => setEditableCustomer(prev => ({
                              ...prev,
                              billing_address: { ...prev.billing_address, state: e.target.value }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                          <input
                            type="text"
                            value={editableCustomer.billing_address.zipCode}
                            onChange={(e) => setEditableCustomer(prev => ({
                              ...prev,
                              billing_address: { ...prev.billing_address, zipCode: e.target.value }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Country</label>
                          <input
                            type="text"
                            value={editableCustomer.billing_address.country}
                            onChange={(e) => setEditableCustomer(prev => ({
                              ...prev,
                              billing_address: { ...prev.billing_address, country: e.target.value }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
