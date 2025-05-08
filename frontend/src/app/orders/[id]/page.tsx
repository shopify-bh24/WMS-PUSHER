'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { getNames } from 'country-list';
import dynamic, { noSSR } from 'next/dynamic';
import 'react-phone-number-input/style.css';
import { getSession } from 'next-auth/react';
import Header from '@/components/Header';
import { toast } from 'react-toastify';

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
  properties?: Array<{ name: string; value: string }>;
  variant_id?: number;
  product_id?: number;
}

interface OrderState {
  id: string;
  shopify_order_id: string;
  order_number: string;
  name: string;
  created_at: string;
  updated_at: string;
  processed_at: string;
  closed_at: string | null;
  cancelled_at: string | null;
  email: string;
  currency: string;
  presentment_currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: number;
  total_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  subtotal_price: number;
  subtotal_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_tax: number;
  total_tax_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_discounts: number;
  total_discounts_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_line_items_price: number;
  total_line_items_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_shipping_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_outstanding: number;
  total_weight: number;
  total_tip_received: number;
  source: string;
  items: OrderItem[];
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
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string;
    variant_title: string;
    fulfillment_status: string;
    fulfillment_service: string;
    grams: number;
    product_id: number;
    variant_id: number;
    vendor: string;
    name: string;
    gift_card: boolean;
    price_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    properties: Array<{
      name: string;
      value: string;
    }>;
    taxable: boolean;
    tax_lines: Array<{
      title: string;
      price: string;
      price_set: {
        shop_money: {
          amount: string;
          currency_code: string;
        };
        presentment_money: {
          amount: string;
          currency_code: string;
        };
      };
      rate: number;
      channel_liable: boolean;
    }>;
    total_discount: string;
    total_discount_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    discount_allocations: Array<{
      amount: string;
      discount_application_index: number;
      amount_set: {
        shop_money: {
          amount: string;
          currency_code: string;
        };
        presentment_money: {
          amount: string;
          currency_code: string;
        };
      };
    }>;
  }>;
  shipping_lines: Array<{
    code: string;
    price: string;
    price_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    discounted_price: string;
    discounted_price_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    source: string;
    title: string;
    tax_lines: any[];
    carrier_identifier: string;
    requested_fulfillment_service_id: string;
    is_removed: boolean;
  }>;
  tags: string[];
  note_attributes: Array<{
    name: string;
    value: string;
  }>;
  source_name: string;
  source_identifier: string;
  source_url: string;
  test: boolean;
  token: string;
  taxes_included: boolean;
  duties_included: boolean;
  payment_gateway_names: string[];
  phone: string;
  confirmed: boolean;
  estimated_taxes: boolean;
  customer_locale: string;
  landing_site: string;
  referring_site: string;
  order_status_url: {
    order_status_url: string;
  };
  timeline: any[];
  conversion_summary: any;
  order_risk: any;
  wmsStatus?: string;
}

interface EditableCustomer {
  id?: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  tags: string;
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

const getCountryCode = (countryName: string): string => {
  const countryCodeMap: { [key: string]: string } = {
    'Japan': 'JP',
    'United States': 'US',
    'Canada': 'CA',
    'United Kingdom': 'GB',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'China': 'CN',
    'South Korea': 'KR',
    'Singapore': 'SG',
    'Hong Kong': 'HK',
    'Taiwan': 'TW',
    'Thailand': 'TH',
    'Vietnam': 'VN',
    'Malaysia': 'MY',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'India': 'IN'
  };

  return countryCodeMap[countryName] || 'JP'; // Default to Japan if country not found
};

const formatCurrency = (amount: number, currencyCode: string): string => {
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
  return new Intl.NumberFormat(undefined, options).format(amount);
};

const initialOrderState: OrderState = {
  id: '',
  shopify_order_id: '',
  order_number: '',
  name: '',
  created_at: '',
  updated_at: '',
  processed_at: '',
  closed_at: null,
  cancelled_at: null,
  email: '',
  currency: 'USD',
  presentment_currency: 'USD',
  financial_status: 'pending',
  fulfillment_status: null,
  total_price: 0,
  total_price_set: {
    shop_money: {
      amount: '0',
      currency_code: 'USD'
    },
    presentment_money: {
      amount: '0',
      currency_code: 'USD'
    }
  },
  subtotal_price: 0,
  subtotal_price_set: {
    shop_money: {
      amount: '0',
      currency_code: 'USD'
    },
    presentment_money: {
      amount: '0',
      currency_code: 'USD'
    }
  },
  total_tax: 0,
  total_tax_set: {
    shop_money: {
      amount: '0',
      currency_code: 'USD'
    },
    presentment_money: {
      amount: '0',
      currency_code: 'USD'
    }
  },
  total_discounts: 0,
  total_discounts_set: {
    shop_money: {
      amount: '0',
      currency_code: 'USD'
    },
    presentment_money: {
      amount: '0',
      currency_code: 'USD'
    }
  },
  total_line_items_price: 0,
  total_line_items_price_set: {
    shop_money: {
      amount: '0',
      currency_code: 'USD'
    },
    presentment_money: {
      amount: '0',
      currency_code: 'USD'
    }
  },
  total_shipping_price_set: {
    shop_money: {
      amount: '0',
      currency_code: 'USD'
    },
    presentment_money: {
      amount: '0',
      currency_code: 'USD'
    }
  },
  total_outstanding: 0,
  total_weight: 0,
  total_tip_received: 0,
  source: '',
  items: [],
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
  line_items: [],
  shipping_lines: [],
  tags: [],
  note_attributes: [],
  source_name: '',
  source_identifier: '',
  source_url: '',
  test: false,
  token: '',
  taxes_included: false,
  duties_included: false,
  payment_gateway_names: [],
  phone: '',
  confirmed: false,
  estimated_taxes: false,
  customer_locale: '',
  landing_site: '',
  referring_site: '',
  order_status_url: {
    order_status_url: ''
  },
  timeline: [],
  conversion_summary: null,
  order_risk: null,
  wmsStatus: 'Unknown',
};

function normalizeTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === 'string') {
    return tags.split(',').map(tag => tag.trim()).filter(Boolean);
  }
  return [];
}

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
    tags: '',
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
  });

  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const [currentTagInput, setCurrentTagInput] = useState('');

  const [isShippingCollapsed, setIsShippingCollapsed] = useState(true);
  const [isBillingCollapsed, setIsBillingCollapsed] = useState(true);
  const [itemsWithImages, setItemsWithImages] = useState<any[]>([]);

  const [tempQuantities, setTempQuantities] = useState<Record<string | number, number>>({});

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTagInput.trim()) {
      e.preventDefault();
      const newTag = currentTagInput.trim();
      const prevTags = Array.isArray(order.tags)
        ? order.tags
        : (typeof order.tags === 'string'
          ? (order.tags as string).split(',').map(tag => tag.trim()).filter(Boolean)
          : []);
      const newTags = Array.from(new Set([...prevTags, newTag]));
      setOrder((prev: any) => ({
        ...prev,
        tags: newTags.join(',')
      }));
      setCurrentTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditableCustomer(prev => ({
      ...prev,
      tags: (prev.tags as string).split(',').filter(tag => tag !== tagToRemove).join(',')
    }));
  };

  useEffect(() => {
    const fetchVariantImage = async (variantId: string) => {
      const res = await axios.get(`/api/shopify/variants/${variantId}`);
      return res.data.image_url;
    };


    const fetchOrder = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(`/api/shopify/orders/${params!.id}`);
        const shopifyOrder = response.data.order;

        const itemsWithImages = await Promise.all(
          shopifyOrder.line_items.map(async (item: any) => {
            const imageUrl = item.variant_id ? await fetchVariantImage(item.variant_id) : null;
            return {
              ...item,
              image_url: imageUrl,
            };
          })
        );

        setItemsWithImages(itemsWithImages);


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

        const tagsArray = normalizeTags(shopifyOrder.tags);

        setOrder({
          id: shopifyOrder.id.toString(),
          shopify_order_id: shopifyOrder.id.toString(),
          order_number: `#${shopifyOrder.order_number}`,
          name: shopifyOrder.name || '',
          created_at: shopifyOrder.created_at,
          updated_at: shopifyOrder.updated_at,
          processed_at: shopifyOrder.processed_at,
          closed_at: shopifyOrder.closed_at,
          cancelled_at: shopifyOrder.cancelled_at,
          email: shopifyOrder.customer?.email || '',
          currency: currencyCode,
          presentment_currency: shopifyOrder.presentment_currency || 'USD',
          financial_status: shopifyOrder.financial_status,
          fulfillment_status: currentFulfillmentStatus,
          total_price: parseFloat(shopifyOrder.total_price || '0'),
          total_price_set: shopifyOrder.total_price_set,
          subtotal_price: parseFloat(shopifyOrder.subtotal_price || '0'),
          subtotal_price_set: shopifyOrder.subtotal_price_set,
          total_tax: parseFloat(shopifyOrder.total_tax || '0'),
          total_tax_set: shopifyOrder.total_tax_set,
          total_discounts: parseFloat(shopifyOrder.total_discounts || '0'),
          total_discounts_set: shopifyOrder.total_discounts_set,
          total_line_items_price: parseFloat(shopifyOrder.total_line_items_price || '0'),
          total_line_items_price_set: shopifyOrder.total_line_items_price_set,
          total_shipping_price_set: shopifyOrder.total_shipping_price_set,
          total_outstanding: parseFloat(shopifyOrder.total_outstanding || '0'),
          total_weight: parseFloat(shopifyOrder.total_weight || '0'),
          total_tip_received: parseFloat(shopifyOrder.total_tip_received || '0'),
          source: shopifyOrder.source_name === 'draft_order' ? 'from Draft Orders' : 'from Draft Orders',
          items: shopifyOrder.line_items.map((item: any) => ({
            id: item.id,
            name: item.title,
            sku: item.sku || 'N/A',
            quantity: item.quantity,
            price: formatCurrency(item.price, currencyCode),
            total: formatCurrency(item.quantity * parseFloat(item.price), currencyCode),
            variant_title: item.variant_title,
            image_url: item.image_url || undefined,
            properties: item.properties || [],
            variant_id: item.variant_id,
            product_id: item.product_id,
          })),
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
          line_items: shopifyOrder.line_items,
          shipping_lines: shopifyOrder.shipping_lines,
          tags: tagsArray,
          note_attributes: shopifyOrder.note_attributes,
          source_name: shopifyOrder.source_name || '',
          source_identifier: shopifyOrder.source_identifier || '',
          source_url: shopifyOrder.source_url || '',
          test: shopifyOrder.test || false,
          token: shopifyOrder.token || '',
          taxes_included: shopifyOrder.taxes_included || false,
          duties_included: shopifyOrder.duties_included || false,
          payment_gateway_names: shopifyOrder.payment_gateway_names || [],
          phone: shopifyOrder.phone || '',
          confirmed: shopifyOrder.confirmed || false,
          estimated_taxes: shopifyOrder.estimated_taxes || false,
          customer_locale: shopifyOrder.customer_locale || '',
          landing_site: shopifyOrder.landing_site || '',
          referring_site: shopifyOrder.referring_site || '',
          order_status_url: shopifyOrder.order_status_url,
          timeline: [],
          conversion_summary: null,
          order_risk: null,
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
          ? order.customer.tags.join(',')
          : (typeof order.customer.tags === 'string'
            ? order.customer.tags
            : ''),
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
      await axios.post(`/api/shopify/customer_update`, {
        orderId: params!.id,
        action: 'update_status',
        status: selectedStatus
      });

      // Then update the database
      await axios.put(`/api/orders/${params!.id}`, {
        fulfillment_status: selectedStatus,
        shopify_order_id: params!.id,
        note: editableNotes,
      });

      // Update local state
      setOrder(prev => ({ ...prev, fulfillment_status: selectedStatus }));

      setUpdateMessage({
        type: 'success',
        message: `Order status updated to ${selectedStatus}`
      });
      toast.success('Order updated successfully!');
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
      ({ type: 'info', message: 'Notes have not changed.' });
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

      console.log(requestData, ": request data console");


      await axios.put(`/api/shopify/orders/${params!.id}`, requestData);

      await axios.put(`http://localhost:5000/api/orders/${params!.id}`, {
        note: editableNotes || null
      });

      setOrder(prev => ({ ...prev, notes: editableNotes }));
      setUpdateMessage({
        type: 'success',
        message: 'Order notes updated successfully'
      });
      toast.success('Order updated successfully!');
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
      const customerId = order.customer.admin_graphql_api_id.split('/').pop();
      await axios.put(`/api/shopify/customers/${customerId}`, {
        order: {
          tags: Array.isArray(order.tags) ? order.tags.join(',') : order.tags,
        },
        customer: {
          email: editableCustomer.email,
          first_name: editableCustomer.first_name,
          last_name: editableCustomer.last_name,
          phone: editableCustomer.phone,
          state: "enabled"
        }
      });

      await axios.put(`/api/shopify/orders/${params!.id}`, {
        order: {
          id: params!.id,
          tags: Array.isArray(order.tags) ? order.tags.join(', ') : (typeof order.tags === 'string' ? order.tags : ''),
          customer: {
            id: customerId,
            email: order.customer.email,
            first_name: order.customer.first_name,
            last_name: order.customer.last_name,
            phone: order.customer.phone,
          },
          shipping_address: {
            first_name: order.shipping_address.first_name,
            last_name: order.shipping_address.last_name,
            address1: order.shipping_address.address1,
            address2: order.shipping_address.address2,
            city: order.shipping_address.city,
            province: order.shipping_address.province,
            province_code: order.shipping_address.province_code,
            country: order.shipping_address.country,
            country_code: order.shipping_address.country_code,
            zip: order.shipping_address.zip,
            phone: order.shipping_address.phone,
            company: order.shipping_address.company,
            name: order.shipping_address.first_name && order.shipping_address.last_name
              ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
              : null
          },
          billing_address: {
            first_name: order.billing_address.first_name,
            last_name: order.billing_address.last_name,
            address1: order.billing_address.address1,
            address2: order.billing_address.address2,
            city: order.billing_address.city,
            province: order.billing_address.province,
            province_code: order.billing_address.province_code,
            country: order.billing_address.country,
            country_code: order.billing_address.country_code,
            zip: order.billing_address.zip,
            phone: order.billing_address.phone,
            company: order.billing_address.company,
            name: order.billing_address.first_name && order.billing_address.last_name
              ? `${order.billing_address.first_name} ${order.billing_address.last_name}`
              : null
          }
        }
      });


      await axios.put(`http://localhost:5000/api/orders/${params!.id}`, {
        email: order.customer.email,
        tags: Array.isArray(order.tags) ? order.tags.join(', ') : (typeof order.tags === 'string' ? order.tags : ''),
        customer: {
          ...order.customer,
          email: order.customer.email,
          first_name: order.customer.first_name,
          last_name: order.customer.last_name,
          phone: order.customer.phone,
        },
        shipping_address: {
          ...order.shipping_address,
          name: order.shipping_address.first_name && order.shipping_address.last_name
            ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
            : null,
          latitude: order.shipping_address.latitude
            ? Number(order.shipping_address.latitude)
            : null,
          longitude: order.shipping_address.longitude
            ? Number(order.shipping_address.longitude)
            : null,
        },
        billing_address: {
          ...order.billing_address,
          name: order.billing_address.first_name && order.billing_address.last_name
            ? `${order.billing_address.first_name} ${order.billing_address.last_name}`
            : null
        }
      });

      setOrder((prev: any) => ({
        ...prev,
        customer: {
          ...prev.customer,
          email: order.customer.email,
          first_name: order.customer.first_name,
          last_name: order.customer.last_name,
          phone: order.customer.phone,
        },
        tags: Array.isArray(order.tags) ? order.tags.join(', ') : (typeof order.tags === 'string' ? order.tags : ''),
        shipping_address: {
          ...order.shipping_address,
          name: order.shipping_address.first_name && order.shipping_address.last_name
            ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
            : null,
          latitude: order.shipping_address.latitude
            ? Number(order.shipping_address.latitude)
            : null,
          longitude: order.shipping_address.longitude
            ? Number(order.shipping_address.longitude)
            : null,
        },
        billing_address: {
          ...order.billing_address,
          name: order.billing_address.first_name && order.billing_address.last_name
            ? `${order.billing_address.first_name} ${order.billing_address.last_name}`
            : null
        }
      }));

      setUpdateMessage({
        type: 'success',
        message: 'Customer information updated successfully'
      });
      toast.success('Customer information updated successfully!');
    } catch (error: any) {
      console.error('Failed to update customer:', error);
      if (error.response?.status === 422) {
        toast.warning('This country is not supported. Please select a different country.');
      } else {
        setUpdateMessage({
          type: 'error',
          message: error.response?.data?.message || 'Failed to update customer information'
        });
      }
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
      <Header />
      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {order.order_number}
              </h2>
              {order.financial_status && renderStatusBadge(
                order.financial_status === 'pending' ? 'Payment pending' : order.financial_status,
                order.financial_status === 'paid' ? 'green' : 'yellow'
              )}
              {renderStatusBadge(
                order.fulfillment_status || 'Unfulfilled',
                order.fulfillment_status === 'fulfilled' ? 'green' : 'yellow'
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString()} {order.source && `${order.source}`}
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
                {itemsWithImages.map((item: any) => (
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
                      <p className="text-xs text-gray-500">{item.variant_title}</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      {/* <button
                        onClick={() => handleLocalQuantityChange(item.id, Math.max(1, (tempQuantities[item.id] || item.quantity) - 1))}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                        disabled={isUpdating}
                      >
                        -
                      </button> */}
                      <span>{tempQuantities[item.id] || item.quantity}</span>
                      {/* <button
                        onClick={() => handleLocalQuantityChange(item.id, (tempQuantities[item.id] || item.quantity) + 1)}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                        disabled={isUpdating}
                      >
                        +
                      </button> */}
                      <span className="ml-2">x {item.price}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{item.total}</div>
                  </div>
                ))}
              </div>
              {/* {Object.keys(tempQuantities).length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleUpdateQuantities}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Update Quantities'}
                  </button>
                </div>
              )} */}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                {order.financial_status && renderStatusBadge(
                  order.financial_status === 'pending' ? 'Payment pending' : order.financial_status,
                  order.financial_status === 'paid' ? 'green' : 'yellow'
                )}
              </div>
              <div className="p-4 sm:p-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{order.items.reduce((total, item) => total + item.quantity, 0)} items</span>
                  <span className="text-gray-900">{order.subtotal_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes</span>
                  <span className="text-gray-500">CT 10%</span>
                  <span className="text-gray-900">{order.total_tax.toFixed(2)}</span>
                </div>
                {parseFloat(order.total_shipping_price_set.shop_money.amount.replace(/[^0-9.-]+/g, "")) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">{order.total_shipping_price_set.shop_money.amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{order.total_price.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid</span>
                  <span className="text-gray-900">{order.total_outstanding.toFixed(2)}</span>
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
                        value={order.customer.email}
                        onChange={(e) => setOrder(prev => ({ ...prev, customer: { ...prev.customer, email: e.target.value } }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(Array.isArray(order.tags)
                          ? order.tags
                          : (typeof order.tags === 'string'
                            ? (order.tags as string).split(',').map(tag => tag.trim()).filter(Boolean)
                            : [])
                        ).map((tag, idx) => (
                          <span
                            key={tag + idx}
                            className="flex items-center bg-gray-300 text-black rounded px-2 py-1 text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              className="ml-1 text-gray-500 hover:text-red-500"
                              onClick={() => {
                                setOrder(prev => ({
                                  ...prev,
                                  tags: Array.isArray(prev.tags)
                                    ? prev.tags.filter((t, i) => i !== idx)
                                    : (typeof prev.tags === 'string'
                                      ? (prev.tags as string).split(',').map(tag => tag.trim()).filter(Boolean).filter((_, i) => i !== idx)
                                      : [])
                                }))
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          value={currentTagInput}
                          onChange={e => setCurrentTagInput(e.target.value)}
                          onKeyDown={(e) => { handleTagKeyDown(e) }}
                          placeholder="Add tag and press Enter"
                        />
                      </div>
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
                        value={order.shipping_address.country || ''}
                        onChange={e => {
                          const selectedCountry = e.target.value;
                          // Get country code based on selected country
                          const countryCode = getCountryCode(selectedCountry);

                          setOrder(prev => ({
                            ...prev,
                            shipping_address: {
                              ...prev.shipping_address,
                              country: selectedCountry,
                              country_code: countryCode
                            }
                          }));
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                      >
                        {countryArray.map((country) => (
                          <option className='text-black' key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <PhoneInput
                          international
                          defaultCountry="US"
                          value={
                            typeof order.shipping_address.phone === "string" &&
                              /^\+\d{1,15}$/.test(order.shipping_address.phone.replace(/\s+/g, ""))
                              ? order.shipping_address.phone.replace(/\s+/g, "")
                              : undefined
                          }
                          onChange={(value: string) =>
                            setOrder(prev => ({
                              ...prev,
                              shipping_address: { ...prev.shipping_address, phone: value || '' }
                            }))
                          }
                          className="mt-1 text-black outline-none block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:opacity-50"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First name</label>
                        <input
                          type="text"
                          value={order.shipping_address.first_name || ''}
                          onChange={e => setOrder(prev => ({
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
                          value={order.shipping_address.last_name || ''}
                          onChange={e => setOrder(prev => ({
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
                        value={order.shipping_address.company || ''}
                        onChange={e => setOrder(prev => ({
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
                          value={order.shipping_address.zip || ''}
                          onChange={e => setOrder(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, zip: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={order.shipping_address.city || ''}
                          onChange={e => setOrder(prev => ({
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
                        value={order.shipping_address.address1 || ''}
                        onChange={e => setOrder(prev => ({
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
                        value={order.shipping_address.address2 || ''}
                        onChange={e => setOrder(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, address2: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>

                  </div>
                </div>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country/region</label>
                        <select
                          disabled={true}
                          value={order.billing_address.country || ''}
                          onChange={e => {
                            const selectedCountry = e.target.value;
                            const countryCode = getCountryCode(selectedCountry);
                            setOrder(prev => ({
                              ...prev,
                              billing_address: {
                                ...prev.billing_address,
                                country: selectedCountry,
                                country_code: countryCode
                              }
                            }));
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                        >
                          {countryArray.map((country) => (
                            <option className='text-black' key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <div className="pointer-events-none">
                          <PhoneInput
                            international
                            defaultCountry="US"
                            value={
                              typeof order.billing_address.phone === "string" &&
                                /^\+\d{1,15}$/.test(order.billing_address.phone.replace(/\s+/g, ""))
                                ? order.billing_address.phone.replace(/\s+/g, "")
                                : undefined
                            }
                            onChange={() => { }}
                            className="mt-1 text-black outline-none block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          />
                        </div>
                      </div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        disabled={true}
                        value={order.billing_address.address1 || ''}
                        onChange={(e) => setOrder(prev => ({
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
                        disabled={true}
                        value={order.billing_address.address2 || ''}
                        onChange={(e) => setOrder(prev => ({
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
                          disabled={true}
                          value={order.billing_address.city || ''}
                          onChange={(e) => setOrder(prev => ({
                            ...prev,
                            billing_address: { ...prev.billing_address, city: e.target.value || null }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country Code</label>
                        <input
                          type="text"
                          disabled={true}
                          value={order.billing_address.country_code || ''}
                          onChange={(e) => setOrder(prev => ({
                            ...prev,
                            billing_address: { ...prev.billing_address, country_code: e.target.value || null }
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
                          disabled={true}
                          value={order.billing_address.zip || ''}
                          onChange={(e) => setOrder(prev => ({
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
                          disabled={true}
                          value={order.billing_address.country || ''}
                          onChange={(e) => setOrder(prev => ({
                            ...prev,
                            billing_address: { ...prev.billing_address, country: e.target.value || null }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main >
    </div >
  );
}
