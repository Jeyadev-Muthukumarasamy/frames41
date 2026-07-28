import type { CheckoutData } from '../types/checkout'

export const CHECKOUT_DATA: CheckoutData = {
  addresses: [
    {
      id: 'addr_home',
      label: 'Home',
      fullName: 'ALEXANDER VANDENBERG',
      line1: '482 Heritage Lane',
      line2: 'Suite 12B, Arts District',
      city: 'New York',
      state: 'NY',
      zip: '10012',
      country: 'United States',
    },
    {
      id: 'addr_studio',
      label: 'Studio',
      fullName: 'ALEXANDER VANDENBERG',
      line1: '901 Industrial Way',
      city: 'Brooklyn',
      state: 'NY',
      zip: '11201',
      country: 'United States',
    },
  ],
  deliveryMethods: [
    {
      id: 'standard',
      name: 'Standard Shipping',
      duration: '3–5 business days',
      priceInr: null,
    },
    {
      id: 'priority',
      name: 'Priority Courier',
      duration: '1–2 business days',
      priceInr: 24,
    },
  ],
  lineItems: [
    {
      id: 'item_samsara',
      name: 'Samsara Vessel II',
      variant: 'Terracotta / Large',
      priceInr: 320,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBOJl4tHiR15d3yXtBaxw0GKRXf3dqlmic6EhV_VYESHMUb4likcXu9GdGet5Ku5nTPh9iegEVzXQpf1ML7OgspoWy1Z3DQCFPp0tbqVLE48iF9JKCrDy6o7MlGxcpey74RePVrk89aTrhGQVsi7yI52MEQ9tZ77oPbjGDmamcdGAqrqK_dN2aBeS81cQUJ4E3cKUi86BzwhzmXDE7UzeDXRUldmb8qgVNw0nWNJQv-ofmAvVXZ-iDeAtT1g4zx_bk-L9ZKKefwsVM',
      imageAlt: 'Handcrafted ceramic vessel with organic texture and earthy matte finish',
    },
    {
      id: 'item_dune',
      name: 'Dune Weave Throw',
      variant: 'Charcoal Wool',
      priceInr: 185,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDmjfhXlqGd-U6UUqh32cB2BbnRe8gqfE4dvZHjYgw-lPVC1l9KoOXMuX3tc1DpPf3x9jOYIhx5OvHynifXh9C006MioBZzlv0C2zMGEa_Zy6PQwCfAgw4GKZx_JpANoHcfXUIV9gmFU1RfRid_sUGsMSAaBMA7ZU74ejusgZgu44dU5VHUkn8KiBJ-qHLfopcW2NydL6trD7NDHgq5jgXi9bij6cmgzky5OYOzdmqPKWeZlM4726lWTLV8_BK73d_iu2Bs0mJDUp4',
      imageAlt: 'Hand-woven textile throw with monochromatic charcoal and cream pattern',
    },
  ],
  totals: {
    subtotalInr: 505,
    taxInr: 42.9,
    shippingInr: 0,
    discountInr: 0,
    totalInr: 547.9,
  },
}

export const DEFAULT_ADDRESS_ID = 'addr_home'
export const DEFAULT_DELIVERY_ID = 'standard'
