'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { getNames } from 'country-list';
import dynamic from 'next/dynamic';
import 'react-phone-number-input/style.css';

const PhoneInput = dynamic(
  () => import('react-phone-number-input').then(mod => mod.default),
  { ssr: false }
);

interface OrderItem {
  id: string | number;
  name: string;
  sku: string;
  quantity: number;
  price: string;
  total: string;
  image_url?: string;
  variant_title?: string;
}

interface OrderState {
  id: string;
  order_number: string;
  created_at: string;
  source: string;
  payment_status: string;
  fulfillment_status: string | null;
  currency: string;
  items: OrderItem[];
  subtotal: string;
  taxes: string;
  shipping_cost: string;
  total: string;
  paid: string;
  balance: string;
  delivery_method: string;
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
    tags: string[];
    tax_exempt: boolean;
    tax_exemptions: string[];
    updated_at: string;
    verified_email: boolean;
  };
  shipping_address: {
    address1: string | null;
    address2: string | null;
    city: string | null;
    company: string | null;
    country: string | null;
    country_code: string | null;
    first_name: string | null;
    last_name: string | null;
    latitude: number | null;
    longitude: number | null;
    name: string | null;
    phone: string | null;
    province: string | null;
    province_code: string | null;
    zip: string | null;
  };
  billing_address: {
    address1: string | null;
    address2: string | null;
    city: string | null;
    company: string | null;
    country: string | null;
    country_code: string | null;
    first_name: string | null;
    last_name: string | null;
    name: string | null;
    phone: string | null;
    province: string | null;
    province_code: string | null;
    zip: string | null;
  };
  timeline: any[];
  conversion_summary: any;
  order_risk: any;
  tags: string[];
  wmsStatus?: string;
}

interface EditableCustomer {
  id?: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  tags: string[];
  shipping_address: {
    address1: string | null;
    address2: string | null;
    city: string | null;
    company: string | null;
    country: string | null;
    country_code: string | null;
    first_name: string | null;
    last_name: string | null;
    latitude: number | null;
    longitude: number | null;
    name: string | null;
    phone: string | null;
    province: string | null;
    province_code: string | null;
    zip: string | null;
  };
  billing_address: {
    address1: string | null;
    address2: string | null;
    city: string | null;
    company: string | null;
    country: string | null;
    country_code: string | null;
    first_name: string | null;
    last_name: string | null;
    name: string | null;
    phone: string | null;
    province: string | null;
    province_code: string | null;
    zip: string | null;
  };
}

const initialOrderState: OrderState = {
  id: '',
  order_number: '',
  created_at: '',
  source: '',
  payment_status: 'pending',
  fulfillment_status: null,
  currency: 'USD',
  items: [],
  subtotal: '¥0',
  taxes: '¥0',
  shipping_cost: '¥0',
  total: '¥0',
  paid: '¥0',
  balance: '¥0',
  delivery_method: 'Shipping',
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
    tags: [],
    tax_exempt: false,
    tax_exemptions: [],
    updated_at: new Date().toISOString(),
    verified_email: false
  },
  shipping_address: {
    address1: null,
    address2: null,
    city: null,
    company: null,
    country: null,
    country_code: null,
    first_name: null,
    last_name: null,
    latitude: null,
    longitude: null,
    name: null,
    phone: null,
    province: null,
    province_code: null,
    zip: null,
  },
  billing_address: {
    address1: null,
    address2: null,
    city: null,
    company: null,
    country: null,
    country_code: null,
    first_name: null,
    last_name: null,
    name: null,
    phone: null,
    province: null,
    province_code: null,
    zip: null,
  },
  timeline: [],
  conversion_summary: null,
  order_risk: null,
  tags: [],
  wmsStatus: 'Unknown',
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
  const countries = getNames();
  const countryArray: string[] = Object.values(countries);

  const [editableCustomer, setEditableCustomer] = useState<EditableCustomer>({
    id: undefined,
    email: '',
    first_name: null,
    last_name: null,
    phone: null,
    tags: [],
    shipping_address: {
      address1: null,
      address2: null,
      city: null,
      company: null,
      country: null,
      country_code: null,
      first_name: null,
      last_name: null,
      latitude: null,
      longitude: null,
      name: null,
      phone: null,
      province: null,
      province_code: null,
      zip: null,
    },
    billing_address: {
      address1: null,
      address2: null,
      city: null,
      company: null,
      country: null,
      country_code: null,
      first_name: null,
      last_name: null,
      name: null,
      phone: null,
      province: null,
      province_code: null,
      zip: null,
    }
  });

  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const [currentTagInput, setCurrentTagInput] = useState('');

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(false);

  const [isShippingCollapsed, setIsShippingCollapsed] = useState(true);
  const [isBillingCollapsed, setIsBillingCollapsed] = useState(true);

  const [isBillingAddressOpen, setIsBillingAddressOpen] = useState(false);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTagInput.trim()) {
      e.preventDefault();
      setEditableCustomer(prev => ({
        ...prev,
        tags: [...prev.tags, currentTagInput.trim()]
      }));
      setCurrentTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditableCustomer(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(`/api/shopify/orders/${params!.id}`);
        const shopifyOrder = response.data.order;
        console.log(shopifyOrder.note, " : shopitfyorder note");


        if (!shopifyOrder) {
          throw new Error('Order data not found in API response');
        }

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
          shipping_cost: formatCurrency(shopifyOrder.total_shipping_price_set?.shop_money?.amount, currencyCode),
          total: formatCurrency(shopifyOrder.total_price, currencyCode),
          paid: formatCurrency(paidAmount, currencyCode),
          balance: formatCurrency(balanceAmount, currencyCode),
          delivery_method: shopifyOrder.shipping_lines?.[0]?.title || 'Shipping',
          notes: shopifyOrder.note || null,
          customer: {
            admin_graphql_api_id: shopifyOrder.customer?.admin_graphql_api_id || '',
            email: shopifyOrder.customer?.email || '',
            first_name: shopifyOrder.customer?.first_name || null,
            last_name: shopifyOrder.customer?.last_name || null,
            note: shopifyOrder.customer?.note || null,
            tags: shopifyOrder.customer?.tags
              ? (Array.isArray(shopifyOrder.customer.tags)
                ? shopifyOrder.customer.tags
                : (typeof shopifyOrder.customer.tags === 'string'
                  ? shopifyOrder.customer.tags.split(',').map((tag: string) => tag.trim())
                  : []))
              : [],
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
            multipass_identifier: shopifyOrder.customer?.multipass_identifier || null,
            phone: shopifyOrder.customer?.phone || null,
          },
          shipping_address: {
            address1: shopifyOrder.shipping_address?.address1 || null,
            address2: shopifyOrder.shipping_address?.address2 || null,
            city: shopifyOrder.shipping_address?.city || null,
            company: shopifyOrder.shipping_address?.company || null,
            country: shopifyOrder.shipping_address?.country || null,
            country_code: shopifyOrder.shipping_address?.country_code || null,
            first_name: shopifyOrder.shipping_address?.first_name || null,
            last_name: shopifyOrder.shipping_address?.last_name || null,
            latitude: shopifyOrder.shipping_address?.latitude || null,
            longitude: shopifyOrder.shipping_address?.longitude || null,
            name: shopifyOrder.shipping_address?.name || null,
            phone: shopifyOrder.shipping_address?.phone || null,
            province: shopifyOrder.shipping_address?.province || null,
            province_code: shopifyOrder.shipping_address?.province_code || null,
            zip: shopifyOrder.shipping_address?.zip || null,
          },
          billing_address: {
            address1: shopifyOrder.billing_address?.address1 || null,
            address2: shopifyOrder.billing_address?.address2 || null,
            city: shopifyOrder.billing_address?.city || null,
            company: shopifyOrder.billing_address?.company || null,
            country: shopifyOrder.billing_address?.country || null,
            country_code: shopifyOrder.billing_address?.country_code || null,
            first_name: shopifyOrder.billing_address?.first_name || null,
            last_name: shopifyOrder.billing_address?.last_name || null,
            name: shopifyOrder.billing_address?.name || null,
            phone: shopifyOrder.billing_address?.phone || null,
            province: shopifyOrder.billing_address?.province || null,
            province_code: shopifyOrder.billing_address?.province_code || null,
            zip: shopifyOrder.billing_address?.zip || null,
          },
          timeline: [],
          conversion_summary: null,
          order_risk: null,
          tags: Array.isArray(shopifyOrder.tags)
            ? shopifyOrder.tags
            : (shopifyOrder.tags
              ? (shopifyOrder.tags as string).split(',').map((tag: string) => tag.trim())
              : []),
        });

        setSelectedStatus(currentFulfillmentStatus);
        setEditableNotes(shopifyOrder.note || '');

      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(`Failed to fetch order details: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      fetchOrder();
    } else {
      setError('Order ID is missing.');
      setIsLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    if (order.customer) {
      setEditableCustomer({
        id: order.customer.id?.toString(),
        email: order.customer.email || '',
        first_name: order.customer.first_name || null,
        last_name: order.customer.last_name || null,
        phone: order.customer.phone || null,
        tags: Array.isArray(order.customer.tags)
          ? order.customer.tags
          : (order.customer.tags
            ? (order.customer.tags as string).split(',').map((tag: string) => tag.trim())
            : []),
        shipping_address: {
          address1: order.shipping_address.address1 || null,
          address2: order.shipping_address.address2 || null,
          city: order.shipping_address.city || null,
          company: order.shipping_address.company || null,
          country: order.shipping_address.country || null,
          country_code: order.shipping_address.country_code || null,
          first_name: order.shipping_address.first_name || null,
          last_name: order.shipping_address.last_name || null,
          latitude: order.shipping_address.latitude || null,
          longitude: order.shipping_address.longitude || null,
          name: order.shipping_address.name || null,
          phone: order.shipping_address.phone || null,
          province: order.shipping_address.province || null,
          province_code: order.shipping_address.province_code || null,
          zip: order.shipping_address.zip || null,
        },
        billing_address: {
          address1: order.billing_address.address1 || null,
          address2: order.billing_address.address2 || null,
          city: order.billing_address.city || null,
          company: order.billing_address.company || null,
          country: order.billing_address.country || null,
          country_code: order.billing_address.country_code || null,
          first_name: order.billing_address.first_name || null,
          last_name: order.billing_address.last_name || null,
          name: order.billing_address.name || null,
          phone: order.billing_address.phone || null,
          province: order.billing_address.province || null,
          province_code: order.billing_address.province_code || null,
          zip: order.billing_address.zip || null,
        }
      });
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      // First update Shopify via API
      const shopifyResponse = await axios.post(`/api/shopify/customer_update`, {
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
      return;
    }

    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      const requestData = {
        order: {
          id: params!.id,
          note: editableNotes || null
        }
      };

      await axios.put(`/api/shopify/orders/${params!.id}`, requestData);

      setOrder(prev => ({ ...prev, notes: editableNotes }));
      setUpdateMessage({
        type: 'success',
        message: 'Order notes updated successfully'
      });
    } catch (error: any) {
      console.error('Failed to update notes:', error);
      console.error('Error response:', error.response?.data);
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

  const handleCustomerUpdate = async () => {
    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });

    try {
      const customerResponse = await axios.put(`/api/shopify/customers/${order.customer.admin_graphql_api_id.split('/').pop()}`, {
        customer: {
          email: editableCustomer.email,
          first_name: editableCustomer.first_name,
          last_name: editableCustomer.last_name,
          phone: editableCustomer.phone,
          tags: editableCustomer.tags.join(','),
          state: "enabled"
        }
      });

      const orderResponse = await axios.put(`/api/shopify/orders/${params!.id}`, {
        order: {
          customer: {
            id: order.customer.admin_graphql_api_id.split('/').pop(),
            email: editableCustomer.email,
            first_name: editableCustomer.first_name,
            last_name: editableCustomer.last_name,
            phone: editableCustomer.phone,
            tags: editableCustomer.tags.join(',')
          },
          shipping_address: {
            first_name: editableCustomer.shipping_address.first_name,
            last_name: editableCustomer.shipping_address.last_name,
            address1: editableCustomer.shipping_address.address1,
            address2: editableCustomer.shipping_address.address2,
            city: editableCustomer.shipping_address.city,
            province: editableCustomer.shipping_address.province,
            province_code: editableCustomer.shipping_address.province_code,
            country: editableCustomer.shipping_address.country,
            country_code: editableCustomer.shipping_address.country_code,
            zip: editableCustomer.shipping_address.zip,
            phone: editableCustomer.shipping_address.phone,
            company: editableCustomer.shipping_address.company,
            name: editableCustomer.shipping_address.name
          },
          billing_address: {
            first_name: editableCustomer.first_name,
            last_name: editableCustomer.last_name,
            address1: editableCustomer.billing_address.address1,
            address2: editableCustomer.billing_address.address2,
            city: editableCustomer.billing_address.city,
            province: editableCustomer.billing_address.province,
            province_code: editableCustomer.billing_address.province_code,
            country: editableCustomer.billing_address.country,
            country_code: editableCustomer.billing_address.country_code,
            zip: editableCustomer.billing_address.zip,
            phone: editableCustomer.billing_address.phone,
            company: editableCustomer.billing_address.company,
            name: editableCustomer.first_name && editableCustomer.last_name
              ? `${editableCustomer.first_name} ${editableCustomer.last_name}`
              : null
          }
        }
      });

      console.log(customerResponse.data, "customer_response");
      console.log(orderResponse.data, "order_response");

      // Update local state after successful API calls
      setOrder((prev: any) => ({
        ...prev,
        customer: {
          // ...prev.customer,
          email: editableCustomer.email,
          first_name: editableCustomer.first_name,
          last_name: editableCustomer.last_name,
          phone: editableCustomer.phone,
          tags: editableCustomer.tags
        },
        shipping_address: {
          ...editableCustomer.shipping_address,
          latitude: editableCustomer.shipping_address.latitude
            ? Number(editableCustomer.shipping_address.latitude)
            : null,
          longitude: editableCustomer.shipping_address.longitude
            ? Number(editableCustomer.shipping_address.longitude)
            : null,
        },
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

      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {order.order_number}
              </h2>
              {order.payment_status && renderStatusBadge(
                order.payment_status === 'pending' ? 'Payment pending' : order.payment_status,
                order.payment_status === 'paid' ? 'green' : 'yellow' // Adjust logic as needed
              )}
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

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Unfulfilled ({order.items.length})
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <p className="text-sm text-gray-500">Delivery method: {order.delivery_method}</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
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
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
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
              </div>
            </div>

          </div>

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
                          // await handleStatusUpdate();
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
                  }}
                  disabled={isUpdating}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="">
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
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={
                          typeof editableCustomer.billing_address.phone === "string" &&
                            /^\+\d{1,15}$/.test(editableCustomer.billing_address.phone.replace(/\s+/g, ""))
                            ? editableCustomer.billing_address.phone.replace(/\s+/g, "")
                            : undefined
                        }
                        onChange={(value: string) =>
                          setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, phone: value || '' }
                          }))
                        }
                        className="mt-1 text-black outline-none block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Shipping address</h4>
                    <button
                      onClick={() => setIsShippingCollapsed(!isShippingCollapsed)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      {isShippingCollapsed ? 'Show' : 'Hide'}
                    </button>
                  </div>
                  <div
                    className={`space-y-4 transition-all duration-300 ease-in-out overflow-hidden ${isShippingCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
                      }`}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country/region</label>
                      <select
                        value={editableCustomer.shipping_address.country || ''}
                        onChange={e => setEditableCustomer(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, country: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                      >
                        <option className='text-black' value="">Select country</option>
                        {countryArray.map((country) => (
                          <option className='text-black' key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First name</label>
                        <input
                          type="text"
                          value={editableCustomer.shipping_address.first_name || ''}
                          onChange={e => setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, first_name: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last name</label>
                        <input
                          type="text"
                          value={editableCustomer.shipping_address.last_name || ''}
                          onChange={e => setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, last_name: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <input
                        type="text"
                        value={editableCustomer.shipping_address.company || ''}
                        onChange={e => setEditableCustomer(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, company: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Postal code</label>
                        <input
                          type="text"
                          value={editableCustomer.shipping_address.zip || ''}
                          onChange={e => setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, zip: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700">Prefecture</label>
                        <select
                          value={editableCustomer.shipping_address.province || ''}
                          onChange={e => setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, province: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="">Select prefecture</option>
                          <option value="Shizuoka">Shizuoka</option>
                        </select>
                      </div> */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={editableCustomer.shipping_address.city || ''}
                          onChange={e => setEditableCustomer(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, city: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        value={editableCustomer.shipping_address.address1 || ''}
                        onChange={e => setEditableCustomer(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, address1: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Apartment, suite, etc</label>
                      <input
                        type="text"
                        value={editableCustomer.shipping_address.address2 || ''}
                        onChange={e => setEditableCustomer(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, address2: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>

                  </div>
                </div>
                {/* <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Tags</label>
                      <input
                        type="text"
                        value={currentTagInput}
                        onChange={(e) => setCurrentTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Type a tag and press Enter"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                      <p className="mt-1 text-xs text-gray-500">Press Enter to add a tag</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editableCustomer.tags.map((tag, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-indigo-500 hover:text-indigo-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div> */}
                {order.billing_address.address1 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Billing address</h4>
                      <button
                        onClick={() => setIsBillingCollapsed(!isBillingCollapsed)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        {isBillingCollapsed ? 'Show' : 'Hide'}
                      </button>
                    </div>
                    <div
                      className={`space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${isBillingCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
                        }`}
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                          type="text"
                          value={editableCustomer.billing_address.address1 || ''}
                          onChange={(e) => setEditableCustomer(prev => ({
                            ...prev,
                            billing_address: { ...prev.billing_address, address1: e.target.value || null }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address 2</label>
                        <input
                          type="text"
                          value={editableCustomer.billing_address.address2 || ''}
                          onChange={(e) => setEditableCustomer(prev => ({
                            ...prev,
                            billing_address: { ...prev.billing_address, address2: e.target.value || null }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            value={editableCustomer.billing_address.city || ''}
                            onChange={(e) => setEditableCustomer(prev => ({
                              ...prev,
                              billing_address: { ...prev.billing_address, city: e.target.value || null }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            value={editableCustomer.billing_address.province || ''}
                            onChange={(e) => setEditableCustomer(prev => ({
                              ...prev,
                              billing_address: { ...prev.billing_address, province: e.target.value || null }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                          <input
                            type="text"
                            value={editableCustomer.billing_address.zip || ''}
                            onChange={(e) => setEditableCustomer(prev => ({
                              ...prev,
                              billing_address: { ...prev.billing_address, zip: e.target.value || null }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Country</label>
                          <input
                            type="text"
                            value={editableCustomer.billing_address.country || ''}
                            onChange={(e) => setEditableCustomer(prev => ({
                              ...prev,
                              billing_address: { ...prev.billing_address, country: e.target.value || null }
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
