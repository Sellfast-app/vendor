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