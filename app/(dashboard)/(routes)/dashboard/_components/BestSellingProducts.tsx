import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

// Define TypeScript interfaces
interface BestSellingProduct {
  product_id: string;
  name: string;
  sku: string | null;
  total_quantity: string;
  revenue: string;
  image?: string;
  product_image?: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: BestSellingProduct[];
}

interface ProductApiResponse {
  status: string;
  data: {
    products?: Array<{
      id: string;
      name: string;
      images?: string[];
      image?: string;
      product_image?: string;
    }>;
  };
}

const BestSellingProducts = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [products, setProducts] = useState<BestSellingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const periods = ['Today', 'This Week', 'This Month', 'This Year'];

  // Map period to date range
  const getDateRange = (period: string) => {
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (period) {
      case 'Today':
        return { start: formatDate(now), end: formatDate(now) };
      case 'This Week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return { start: formatDate(startOfWeek), end: formatDate(now) };
      case 'This Month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: formatDate(startOfMonth), end: formatDate(now) };
      case 'This Year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return { start: formatDate(startOfYear), end: formatDate(now) };
      default:
        return { start: '', end: '' };
    }
  };

  // Fetch product images using your existing products API (like orders API does)
  const fetchProductImages = async (productIds: string[]): Promise<{[key: string]: string}> => {
    try {
      const token = localStorage.getItem('token');
      
      // Use your existing products API to get all products and extract images
      const response = await fetch('/api/products?pageSize=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result: ProductApiResponse = await response.json();
        
        if (result.status === 'success' && result.data.products) {
          const imageMap: {[key: string]: string} = {};
          
          // Create a map of product ID to image URL
          result.data.products.forEach(product => {
            if (productIds.includes(product.id)) {
              const imageUrl = product.images?.[0] || product.image || product.product_image;
              if (imageUrl) {
                imageMap[product.id] = imageUrl;
              }
            }
          });
          
          return imageMap;
        }
      }
    } catch (error) {
      console.error('Failed to fetch product images:', error);
    }
    return {};
  };

  // Fetch best selling products
  const fetchBestSellingProducts = async (period: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { start, end } = getDateRange(period);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: '1',
        pageSize: '20',
        ...(start && { start }),
        ...(end && { end }),
      });

      const response = await fetch(
        `/api/dashboard/best-selling?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const result: ApiResponse = await response.json();
      
      console.log('Best selling products response:', result);
      
      if (result.status === 'success' && result.data) {
        // Check if images are already included in the response
        const firstProduct = result.data[0];
        
        if (firstProduct.image || firstProduct.product_image) {
          // Images are already included - use them directly
          console.log('Images already included in best-selling response');
          setProducts(result.data);
        } else {
          // Images are not included - fetch them from products API
          console.log('Fetching images from products API...');
          const productIds = result.data.map(p => p.product_id);
          const imageMap = await fetchProductImages(productIds);
          
          // Enrich products with images
          const productsWithImages = result.data.map(product => ({
            ...product,
            image: imageMap[product.product_id] || undefined
          }));
          
          setProducts(productsWithImages);
        }
      } else {
        console.error("API Error:", result.message);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch best selling products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or period changes
  useEffect(() => {
    fetchBestSellingProducts(selectedPeriod);
  }, [selectedPeriod]);

  // Format currency
  const formatCurrency = (amount: string) => {
    const numericAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(numericAmount);
  };

  // Format quantity
  const formatQuantity = (quantity: string) => {
    return `${quantity} unit${parseInt(quantity) !== 1 ? 's' : ''}`;
  };

  return (
    <Card className="w-full shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-bold">
              Best Selling Products
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? 'Loading products...' : `Your best performing products ${selectedPeriod.toLowerCase()}.`}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-background border border-[#F5F5F5] dark:border-[#1F1F1F] rounded-lg disabled:opacity-50"
            >
              {selectedPeriod}
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-background border border-[#F5F5F5] dark:border-[#1F1F1F] rounded-lg shadow-lg z-10">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm first:rounded-t-lg last:rounded-b-lg ${
                      selectedPeriod === period ? 'bg-background text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {!loading && products.length > 0 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-500">Products</span>
            <span className="text-sm font-medium text-gray-500">Sales</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {loading ? (
          // Skeleton Loading State
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // No Data Available State
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0h-4" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">No products found</p>
            <p className="text-gray-400 text-xs mt-1">Try selecting a different time period</p>
          </div>
        ) : (
          // Products List
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.product_id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {product.image || product.product_image ? (
                      <Image 
                        src={product.image || product.product_image || ''} 
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-green-600 font-medium">
                      {product.sku || ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatQuantity(product.total_quantity)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BestSellingProducts;