"use client";

import React from 'react';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
  units: number;
  status: 'low' | 'normal';
  statusText?: string;
  deliveryInfo?: string;
  trend: string;
  trendValue: string;
}

const productsData: Product[] = [
  {
    id: '1',
    name: 'Creamy Milkshake Fruit Parfait',
   image: '/Iphone.png',
    units: 156,
    status: 'low',
    statusText: 'Projected Low in 5 days',
    trend: 'High',
    trendValue: '45 units/week'
  },
  {
    id: '2',
    name: 'Jollof Rice, Chicken & Salad',
    image: '/Iphone.png',
    units: 48,
    status: 'normal',
    deliveryInfo: '1 day - Kwik',
    trend: 'Medium',
    trendValue: '30 units/week'
  },
  {
    id: '3',
    name: 'Amazake Chicken Fried Rice',
   image: '/Iphone.png',
    units: 48,
    status: 'normal',
    deliveryInfo: '1 day - Kwik',
    trend: 'Medium',
    trendValue: '30 units/week'
  },
  {
    id: '4',
    name: 'Pepperoni & Cheese Hotdog',
   image: '/Iphone.png',
    units: 48,
    status: 'normal',
    deliveryInfo: '1 day - Kwik',
    trend: 'Medium',
    trendValue: '30 units/week'
  },
  {
    id: '5',
    name: 'Pepperoni & Cheese Hotdog',
    image: '/Iphone.png',
    units: 48,
    status: 'normal',
    deliveryInfo: '1 day - Kwik',
    trend: 'Medium',
    trendValue: '30 units/week'
  },
  {
    id: '6',
    name: 'Pepperoni & Cheese Hotdog',
    image: '/Iphone.png',
    units: 48,
    status: 'normal',
    deliveryInfo: '1 day - Kwik',
    trend: 'Medium',
    trendValue: '30 units/week'
  }
];

export default function InventoryTrends() {
  return (
    <div className="w-full bg-card rounded-lg">

      <div className="max-h-[500px] overflow-y-auto">
        {productsData.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-4 p-4 border-b border-[#F5F5F5] dark:border-[#1F1F1F] last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            {/* Product Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.png';
                }}
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{product.name}</h4>
              {product.status === 'low' && product.statusText && (
                <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{product.statusText}</span>
                </div>
              )}
              {product.status === 'normal' && product.deliveryInfo && (
                <div className="text-xs text-green-500 mt-1">
                  {product.deliveryInfo}
                </div>
              )}
            </div>

            {/* Units and Trend */}
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-semibold">{product.units} units</p>
              <p className="text-xs text-gray-500">
                {product.trend}: {product.trendValue}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}