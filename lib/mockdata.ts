export const mockData = [
    { sku: "SKU-HPH-001", productName: "Creamy Milkshake Fruit Parfait", stock: 156, remanent: 150, sales: 5000, status: "Ready Stock" },
    { sku: "SKU-HPH-002", productName: "Milky Doughnut Pack", stock: 156, remanent: 150, sales: 3500, status: "Made-to-order" },
    { sku: "SKU-HPH-003", productName: "Coconut Bread", stock: 156, remanent: 150, sales: 7000, status: "Ready Stock" },
    { sku: "SKU-HPH-004", productName: "Chocolate Chip Cookies", stock: 156, remanent: 150, sales: 3500, status: "Ready Stock" },
    { sku: "SKU-HPH-005", productName: "Frosted Cake Biscuit", stock: 156, remanent: 150, sales: 2500, status: "Made-to-order" },
    { sku: "SKU-HPH-006", productName: "Pineapple Smoothie", stock: 0, remanent: 0, sales: 12340, status: "Out of Stock" },
  ];

  export const orderData = [
    { orderId: "ORD-HPH-001", date: "13/09/2025", customerName: "John Doe", payment: "Paid", total: 15000, items: 3, status: "Fulfilled" },
    { orderId: "ORD-HPH-002", date: "12/09/2025", customerName: "Jane Smith", payment: "Pending", total: 7500, items: 1, status: "Processing" },
    { orderId: "ORD-HPH-003", date: "11/09/2025", customerName: "Mike Johnson", payment: "Failed", total: 20000, items: 4, status: "Shipped" },
    { orderId: "ORD-HPH-004", date: "10/09/2025", customerName: "Sarah Williams", payment: "Paid", total: 12000, items: 2, status: "Pending" },
    { orderId: "ORD-HPH-005", date: "09/09/2025", customerName: "Robert Brown", payment: "Pending", total: 9000, items: 2, status: "Cancelled" },
    { orderId: "ORD-HPH-006", date: "08/09/2025", customerName: "Emily Davis", payment: "Paid", total: 18000, items: 3, status: "Fulfilled" },
  ];

  // lib/mockdata.ts
export interface SalesData {
  id: string;
  productName: string;
  thumbnail: string;
  revenue: number;
  sales: number;
  reviews: number;
  views: number;
  category: string;
}

export const salesMockData: SalesData[] = [
  {
    id: "PRD-001",
    productName: "Premium Cake Mix",
    thumbnail: "/thumbnails/PRD-001.png",
    revenue: 1250000,
    sales: 250,
    reviews: 45,
    views: 1200,
    category: "Bakery"
  },
  {
    id: "PRD-002",
    productName: "Artisan Bread",
    thumbnail: "/thumbnails/PRD-002.png",
    revenue: 890000,
    sales: 178,
    reviews: 32,
    views: 980,
    category: "Bakery"
  },
  {
    id: "PRD-003",
    productName: "Custom Birthday Cake",
    thumbnail: "/thumbnails/PRD-003.png",
    revenue: 2100000,
    sales: 70,
    reviews: 28,
    views: 850,
    category: "Specialty"
  },
  {
    id: "PRD-004",
    productName: "Chocolate Cookies",
    thumbnail: "/thumbnails/PRD-004.png",
    revenue: 450000,
    sales: 900,
    reviews: 67,
    views: 2100,
    category: "Snacks"
  },
  {
    id: "PRD-005",
    productName: "Vegan Pastries",
    thumbnail: "/thumbnails/PRD-005.png",
    revenue: 680000,
    sales: 340,
    reviews: 41,
    views: 1100,
    category: "Specialty"
  },
  {
    id: "PRD-006",
    productName: "Whole Wheat Bread",
    thumbnail: "/thumbnails/PRD-006.png",
    revenue: 720000,
    sales: 240,
    reviews: 38,
    views: 950,
    category: "Bakery"
  },
  {
    id: "PRD-007",
    productName: "Cupcake Assortment",
    thumbnail: "/thumbnails/PRD-007.png",
    revenue: 950000,
    sales: 475,
    reviews: 52,
    views: 1350,
    category: "Snacks"
  },
  {
    id: "PRD-008",
    productName: "Gluten-Free Muffins",
    thumbnail: "/thumbnails/PRD-008.png",
    revenue: 580000,
    sales: 290,
    reviews: 36,
    views: 890,
    category: "Specialty"
  },
  {
    id: "PRD-009",
    productName: "French Baguette",
    thumbnail: "/thumbnails/PRD-009.png",
    revenue: 420000,
    sales: 280,
    reviews: 29,
    views: 760,
    category: "Bakery"
  },
  {
    id: "PRD-010",
    productName: "Donut Box",
    thumbnail: "/thumbnails/PRD-010.png",
    revenue: 1100000,
    sales: 550,
    reviews: 63,
    views: 1650,
    category: "Snacks"
  }
];

export const mockWithdrawalData = [
  { id: "W001", bankTo: "First Bank", amount: 5000, status: "Success", timestamp: "2025-09-22T10:30:00Z", receiptUrl: "/receipts/W001.pdf" },
  { id: "W002", bankTo: "Zenith Bank", amount: 7500, status: "Pending", timestamp: "2025-09-22T11:00:00Z", receiptUrl: "/receipts/W002.pdf" },
  { id: "W003", bankTo: "GTBank", amount: 3000, status: "Failed", timestamp: "2025-09-22T09:45:00Z", receiptUrl: null },
  { id: "W004", bankTo: "Access Bank", amount: 10000, status: "Success", timestamp: "2025-09-22T12:00:00Z", receiptUrl: "/receipts/W004.pdf" },
  { id: "W005", bankTo: "Access Bank", amount: 10000, status: "Success", timestamp: "2025-09-22T12:00:00Z", receiptUrl: "/receipts/W004.pdf" },
  { id: "W006", bankTo: "Access Bank", amount: 10000, status: "Success", timestamp: "2025-09-22T12:00:00Z", receiptUrl: "/receipts/W004.pdf" },
  { id: "W007", bankTo: "Access Bank", amount: 10000, status: "Success", timestamp: "2025-09-22T12:00:00Z", receiptUrl: "/receipts/W004.pdf" },
  // Add more mock data as needed
];

export const mockSubscriptionBillingData = [
  { id: "SB001", card: "1234********5678", amount: 2999, plan: "Basic", status: "Success", timestamp: "2025-09-22T09:00:00Z", receiptUrl: "/receipts/SB001.pdf" },
  { id: "SB002", card: "4321********8765", amount: 4999, plan: "Premium", status: "Pending", timestamp: "2025-09-22T10:15:00Z", receiptUrl: "/receipts/SB002.pdf" },
  { id: "SB003", card: "5678********1234", amount: 1999, plan: "Free", status: "Failed", timestamp: "2025-09-22T11:30:00Z", receiptUrl: null },
  { id: "SB004", card: "8765********4321", amount: 5999, plan: "Pro", status: "Success", timestamp: "2025-09-22T13:00:00Z", receiptUrl: "/receipts/SB004.pdf" },
  { id: "SB005", card: "8765********4321", amount: 5999, plan: "Pro", status: "Success", timestamp: "2025-09-22T13:00:00Z", receiptUrl: "/receipts/SB004.pdf" },
  { id: "SB006", card: "8765********4321", amount: 5999, plan: "Pro", status: "Success", timestamp: "2025-09-22T13:00:00Z", receiptUrl: "/receipts/SB004.pdf" },
  { id: "SB007", card: "8765********4321", amount: 5999, plan: "Pro", status: "Success", timestamp: "2025-09-22T13:00:00Z", receiptUrl: "/receipts/SB004.pdf" },
  // Add more mock data as needed
];

export const mockEscrowData = [
  { id: "ORD-HPH-001", amount: 15000, status: "Escrow", timestamp: "2025-09-22T08:00:00Z", orderInfoUrl: "/order/ORD-HPH-001", trackingUrl: "/track/ORD-HPH-001" },
  { id: "ORD-HPH-002", amount: 25000, status: "Available", timestamp: "2025-09-22T09:15:00Z", orderInfoUrl: "/order/ORD-HPH-002", trackingUrl: "/track/ORD-HPH-002" },
  { id: "ORD-HPH-003", amount: 8000, status: "Escrow", timestamp: "2025-09-22T10:30:00Z", orderInfoUrl: "/order/ORD-HPH-003", trackingUrl: "/track/ORD-HPH-003" },
  { id: "ORD-HPH-004", amount: 12000, status: "Available", timestamp: "2025-09-22T11:45:00Z", orderInfoUrl: "/order/ORD-HPH-004", trackingUrl: "/track/ORD-HPH-004" },
  { id: "ORD-HPH-005", amount: 30000, status: "Escrow", timestamp: "2025-09-22T13:00:00Z", orderInfoUrl: "/order/ORD-HPH-005", trackingUrl: "/track/ORD-HPH-005" },
  { id: "ORD-HPH-006", amount: 5000, status: "Available", timestamp: "2025-09-22T14:15:00Z", orderInfoUrl: "/order/ORD-HPH-006", trackingUrl: "/track/ORD-HPH-006" },
  { id: "ORD-HPH-007", amount: 18000, status: "Escrow", timestamp: "2025-09-22T15:30:00Z", orderInfoUrl: "/order/ORD-HPH-007", trackingUrl: "/track/ORD-HPH-007" },
];