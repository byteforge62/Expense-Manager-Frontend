/**
 * Fallback store catalog.
 *
 * The server sends the authoritative list (`/store-connections`), including the
 * order-history URL and import hint. This copy keeps the picker usable while
 * that request is in flight or if it fails, so linking never depends on a
 * second round trip.
 *
 * `logo` points at the store's own app icon, bundled under
 * `public/logos/stores` so the picker renders the real mark offline.
 */
export const STORE_CATALOG = [
  {
    key: "amazon",
    name: "Amazon",
    mark: "A",
    accent: "#FF9900",
    logo: "/logos/stores/amazon.png",
    tagline: "Orders, invoices and delivery dates from amazon.in",
    ordersUrl: "https://www.amazon.in/gp/css/order-history",
    importHint:
      "Amazon → Your Orders → Request order history report → download the CSV.",
    category: "Marketplace",
  },
  {
    key: "flipkart",
    name: "Flipkart",
    mark: "F",
    accent: "#2874F0",
    logo: "/logos/stores/flipkart.png",
    tagline: "Flipkart order history and itemised totals",
    ordersUrl: "https://www.flipkart.com/account/orders",
    importHint:
      "Flipkart → My Orders → copy the order list, or export it from the app.",
    category: "Marketplace",
  },
  {
    key: "myntra",
    name: "Myntra",
    mark: "M",
    accent: "#FF3F6C",
    logo: "/logos/stores/myntra.jpg",
    tagline: "Fashion orders, returns and exchange values",
    ordersUrl: "https://www.myntra.com/my/orders",
    importHint: "Myntra → Orders → download or copy the order history.",
    category: "Fashion",
  },
  {
    key: "ajio",
    name: "AJIO",
    mark: "AJ",
    accent: "#2B2B2B",
    logo: "/logos/stores/ajio.png",
    tagline: "AJIO purchases and delivery records",
    ordersUrl: "https://www.ajio.com/my-orders",
    importHint: "AJIO → My Orders → export or copy the order list.",
    category: "Fashion",
  },
  {
    key: "meesho",
    name: "Meesho",
    mark: "ME",
    accent: "#F43397",
    logo: "/logos/stores/meesho.jpg",
    tagline: "Meesho order history and prices paid",
    ordersUrl: "https://www.meesho.com/orders",
    importHint: "Meesho → My Orders → copy the order list into the import box.",
    category: "Marketplace",
  },
  {
    key: "nykaa",
    name: "Nykaa",
    mark: "NY",
    accent: "#E80071",
    logo: "/logos/stores/nykaa.jpg",
    tagline: "Beauty orders and repeat purchases",
    ordersUrl: "https://www.nykaa.com/my-orders",
    importHint: "Nykaa → My Orders → export or copy the order history.",
    category: "Beauty",
  },
  {
    key: "croma",
    name: "Croma",
    mark: "CR",
    accent: "#00A3E0",
    logo: "/logos/stores/croma.png",
    tagline: "Electronics invoices and warranty purchases",
    ordersUrl: "https://www.croma.com/my-orders",
    importHint: "Croma → My Orders → export the order history CSV.",
    category: "Electronics",
  },
  {
    key: "reliance-digital",
    name: "Reliance Digital",
    mark: "RD",
    accent: "#E42528",
    logo: "/logos/stores/reliance-digital.jpg",
    tagline: "Appliance and gadget purchase records",
    ordersUrl: "https://www.reliancedigital.in/orders",
    importHint: "Reliance Digital → My Orders → copy or export the order list.",
    category: "Electronics",
  },
  {
    key: "snapdeal",
    name: "Snapdeal",
    mark: "SD",
    accent: "#E4002B",
    logo: "/logos/stores/snapdeal.jpg",
    tagline: "Snapdeal orders and item totals",
    ordersUrl: "https://www.snapdeal.com/myorders",
    importHint: "Snapdeal → My Orders → copy the order list into the import box.",
    category: "Marketplace",
  },
  {
    key: "tatacliq",
    name: "Tata CLiQ",
    mark: "TC",
    accent: "#4863A0",
    logo: "/logos/stores/tatacliq.jpg",
    tagline: "Tata CLiQ orders and invoice values",
    ordersUrl: "https://www.tatacliq.com/my-orders",
    importHint: "Tata CLiQ → My Orders → export or copy the order history.",
    category: "Marketplace",
  },
];

const LOGOS = STORE_CATALOG.reduce((map, store) => {
  map[store.key] = store.logo;
  return map;
}, {});

/** The bundled logo path for a store key, or "" when there is no artwork. */
export const storeLogo = (key) => LOGOS[key] || "";

export const findStore = (key) =>
  STORE_CATALOG.find((store) => store.key === key);
