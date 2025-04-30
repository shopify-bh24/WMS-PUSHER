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
    name: string;
    email: string | null;
    phone: string | null;
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
  customer: { name: '', email: null, phone: null },
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
  // Use the new initial state
  const [order, setOrder] = useState<OrderState>(initialOrderState);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  // Add state for editable notes
  const [editableNotes, setEditableNotes] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState({ type: '', message: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true); // Start loading
      setError(''); // Clear previous errors
      try {
        const response = await axios.get(`/api/shopify/orders/${params!.id}`);
        const shopifyOrder = response.data.order;
        console.log(shopifyOrder, " : Shopify Order response");
        
        if (!shopifyOrder) {
          throw new Error('Order data not found in API response');
        }

        console.log(shopifyOrder, " : Shopify Order response");

        // Helper to format currency
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

        const currencyCode = shopifyOrder.currency || 'USD'; // Get currency code

        // Calculate paid and balance
        const totalAmount = parseFloat(shopifyOrder.total_price || '0');
        // Note: Shopify API might not directly provide 'total_paid'.
        // We infer based on financial_status. This might need refinement.
        // Determine the primary status field (e.g., financial_status or fulfillment_status)
        // For this example, let's assume we want to manage 'fulfillment_status'
        // Or maybe a custom combined status. Let's stick to fulfillment_status for now.
        const currentFulfillmentStatus = shopifyOrder.fulfillment_status || 'unfulfilled'; // Default if null

        const paidAmount = shopifyOrder.financial_status === 'paid' ? totalAmount : 0;
        const balanceAmount = totalAmount - paidAmount;

        setOrder({
          id: shopifyOrder.id.toString(), // Ensure ID is string
          order_number: `#${shopifyOrder.order_number}`,
          created_at: shopifyOrder.created_at,
          // Source might need specific logic or be part of notes/tags
          source: shopifyOrder.source_name === 'draft_order' ? 'from Draft Orders' : shopifyOrder.source_name || 'Unknown Source',
          payment_status: shopifyOrder.financial_status, // e.g., pending, paid, refunded
          fulfillment_status: currentFulfillmentStatus, // Use the determined status
          currency: currencyCode,
          items: shopifyOrder.line_items.map((item: any) => ({
            id: item.id,
            name: item.title,
            sku: item.sku || 'N/A',
            quantity: item.quantity,
            // Format price and total with currency
            price: formatCurrency(item.price, currencyCode),
            total: formatCurrency(item.quantity * parseFloat(item.price), currencyCode),
            // Attempt to get variant title (like XS/S/Black)
            variant_title: item.variant_title,
            // Placeholder for image - needs separate fetch or different API field
            image_url: item.image?.src || undefined, // Example: Check if image data exists
          })),
          // Format totals
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
            id: shopifyOrder.customer?.id,
            name: `${shopifyOrder.customer?.first_name || ''} ${shopifyOrder.customer?.last_name || ''}`.trim() || 'No customer',
            email: shopifyOrder.customer?.email || shopifyOrder.email || null, // Use order email as fallback
            phone: shopifyOrder.customer?.phone || shopifyOrder.phone || null, // Use order phone as fallback
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
        // Optionally set order to initial state or keep previous state
        // setOrder(initialOrderState);
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

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      // Simulate API call to update order status using selectedStatus
      // In a real app, this would call the API with the selectedStatus value
      console.log("Simulating update to status:", selectedStatus);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local state using selectedStatus
      setOrder(prev => ({ ...prev, fulfillment_status: selectedStatus })); // Update fulfillment_status
      setUpdateMessage({
        type: 'success',
        message: `Order status updated to ${selectedStatus}`
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
    // Check if notes actually changed
    if (editableNotes === order.notes) {
      setUpdateMessage({ type: 'info', message: 'Notes have not changed.' });
      setTimeout(() => setUpdateMessage({ type: '', message: '' }), 3000);
      return;
    }

    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      // Simulate API call to update order notes with the value from editableNotes
      console.log("Simulating update to notes:", editableNotes);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state using the editableNotes value
      setOrder(prev => ({ ...prev, notes: editableNotes })); // Use editableNotes here
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
                order.fulfillment_status === 'fulfilled' ? 'green' : 'yellow' // Adjust logic
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Restock</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Edit</button>
              {/* Add Print and More Actions Dropdown */}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString()} {order.source && `from ${order.source}`}
          </p>
        </div>

        {/* Status Update Message */}
        {/* ... existing updateMessage rendering ... */}

        {/* Main Grid Layout (Adjusted for 3 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Spanning 2 columns on large screens) */}
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
                <div className="flex justify-end pt-4">
                  <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Fulfill items
                  </button>
                </div>
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
                  <span className="text-gray-900">{order.items.length} items</span>
                  <span className="text-gray-900">{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes</span>
                  <span className="text-gray-500">CT 10%</span> {/* Adjust tax display */}
                  <span className="text-gray-900">{order.taxes}</span>
                </div>
                 {/* Add Shipping if applicable */}
                 {parseFloat(order.shipping_cost.replace(/[^0-9.-]+/g,"")) > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="text-gray-900">{order.shipping_cost}</span>
                    </div>
                 )}
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{order.total}</span>
                </div>
                <hr className="my-2"/>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid</span>
                  <span className="text-gray-900">{order.paid}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Balance</span>
                  <span className="text-gray-500">Payment due when invoice is sent</span> {/* Adjust text */}
                  <span className="text-gray-900">{order.balance}</span>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                   <button className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Send invoice</button>
                   <button className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900">Mark as paid</button>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Timeline</h3>
              </div>
              <div className="p-4 sm:p-6">
                {/* Comment Input */}
                <div className="flex items-start space-x-3">
                   <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">IM</div> {/* Placeholder Initials */}
                   <div className="min-w-0 flex-1">
                     <textarea
                       rows={3}
                       className="block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="Leave a comment..."
                       value={editableNotes || ''} // Use editableNotes state
                       onChange={(e) => setEditableNotes(e.target.value)}
                     />
                     <div className="mt-2 flex justify-between items-center">
                        {/* Add formatting buttons if needed */}
                        <div></div>
                        <button
                          onClick={handleNotesUpdate} // Reuse or adapt notes update logic
                          disabled={isUpdating}
                          className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          {isUpdating ? 'Posting...' : 'Post'}
                        </button>
                     </div>
                   </div>
                </div>
                {/* Display existing comments/timeline events here */}
                <p className="mt-4 text-center text-xs text-gray-500">Only you and other staff can see comments</p>
              </div>
            </div>

          </div> {/* End Left Column */}

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 space-y-6">

            {/* Notes Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-3 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Notes</h3>
                <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button> {/* Add edit functionality */}
              </div>
              <div className="p-4 sm:p-6 text-sm text-gray-500">
                {order.notes ? order.notes : "No notes from customer"}
              </div>
            </div>

            {/* Customer Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-3 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Customer</h3>
                <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button> {/* Add edit functionality */}
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {/* Search/Create Input */}
                <input type="text" placeholder="Search or create a customer" className="block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm p-2"/>
                {/* Customer Name Link */}
                {order.customer.name !== 'No customer' && (
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:underline block">{order.customer.name}</a>
                )}
                {/* Contact Info */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Contact information</h4>
                  <p className="text-sm text-gray-500">{order.customer.email || 'No email provided'}</p>
                  <p className="text-sm text-gray-500">{order.customer.phone || 'No phone number'}</p>
                </div>
                {/* Shipping Address */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Shipping address</h4>
                  {order.shipping_address.address ? (
                    <address className="text-sm text-gray-500 not-italic">
                      {order.shipping_address.address}<br />
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}<br />
                      {order.shipping_address.country}
                    </address>
                  ) : (
                    <p className="text-sm text-gray-500">No shipping address provided</p>
                  )}
                </div>
                {/* Billing Address */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Billing address</h4>
                  {order.billing_address.address ? (
                     <address className="text-sm text-gray-500 not-italic">
                      {order.billing_address.address}<br />
                      {order.billing_address.city}, {order.billing_address.state} {order.billing_address.zipCode}<br />
                      {order.billing_address.country}
                    </address>
                  ) : (
                    <p className="text-sm text-gray-500">No billing address provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Conversion Summary Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Conversion summary</h3>
              </div>
              <div className="p-4 sm:p-6 text-sm text-gray-500">
                There aren't any conversion details available for this order.
                <a href="#" className="text-indigo-600 hover:underline ml-1">Learn more</a>
              </div>
            </div>

            {/* Order Risk Card */}
             <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-3 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Order risk</h3>
                 {/* Add Risk Icon/Link if available */}
              </div>
              <div className="p-4 sm:p-6 text-sm text-gray-500">
                Analysis not available
              </div>
            </div>

            {/* Tags Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Tags</h3>
              </div>
              <div className="p-4 sm:p-6">
                <input type="text" placeholder="Find or create tags" className="block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm p-2"/>
                {/* Display existing tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {order.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{tag} <button className="ml-1 text-gray-400 hover:text-gray-600">&times;</button></span>
                  ))}
                </div>
              </div>
            </div>

          </div> {/* End Right Column */}

        </div> {/* End Main Grid */}
      </main>
    </div>
  );
}