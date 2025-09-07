import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

const BestSellingProducts = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = ['Today', 'This Week', 'This Month', 'This Year'];

  const products = [
    {
      id: 1,
      name: 'Creamy Milkshake Fruit Parfait',
      sku: 'SKU-HDPHN-001',
      image: '/api/placeholder/48/48',
      sales: '156 units',
      revenue: '₦1,798,990.00'
    },
    {
      id: 2,
      name: 'Jollof Rice, Chicken & Salad',
      sku: 'SKU-HDPHN-002',
      image: '/api/placeholder/48/48',
      sales: '150 units',
      revenue: '₦1,545,445.22'
    },
    {
      id: 3,
      name: 'Amazake Chicken Fried Rice',
      sku: 'SKU-HDPHN-003',
      image: '/api/placeholder/48/48',
      sales: '147 units',
      revenue: '₦908,210.00'
    },
    {
      id: 4,
      name: 'Pepperoni & Cheese Hotdog',
      sku: 'SKU-HDPHN-004',
      image: '/api/placeholder/48/48',
      sales: '122 units',
      revenue: '₦662,009.75'
    }
  ];

  return (
    <Card className="w-full shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-bold">
              Best Selling Products
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Your best performing products this month.
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {selectedPeriod}
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      selectedPeriod === period ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-500">Products</span>
          <span className="text-sm font-medium text-gray-500">Sales</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-green-600 font-medium">
                    {product.sku}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {product.sales}
                </p>
                <p className="text-xs text-gray-500">
                  {product.revenue}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BestSellingProducts;