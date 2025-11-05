"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search } from 'lucide-react';
import Image from 'next/image';

interface ChartData {
  month: string;
  totalViews: number;
  avgViewsPerDay: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  units: number;
  views: number;
  image: string;
}

interface ViewPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const chartData: ChartData[] = [
  { month: 'Jan', totalViews: 10, avgViewsPerDay: 15 },
  { month: 'Feb', totalViews: 30, avgViewsPerDay: 28 },
  { month: 'Mar', totalViews: 25, avgViewsPerDay: 35 },
  { month: 'Apr', totalViews: 35, avgViewsPerDay: -15 },
  { month: 'May', totalViews: -30, avgViewsPerDay: -42 },
  { month: 'Jun', totalViews: -45, avgViewsPerDay: -55 },
  { month: 'Jul', totalViews: -50, avgViewsPerDay: -35 },
  { month: 'Aug', totalViews: -30, avgViewsPerDay: -20 },
  { month: 'Sep', totalViews: 35, avgViewsPerDay: 45 },
  { month: 'Oct', totalViews: 30, avgViewsPerDay: 55 },
  { month: 'Nov', totalViews: 80, avgViewsPerDay: 75 },
  { month: 'Dec', totalViews: 85, avgViewsPerDay: 70 }
];

const productsData: Product[] = [
  {
    id: '1',
    name: 'Creamy Milkshake...',
    sku: 'SKU-HDPHN-001',
    units: 156,
    views: 14090,
    image: '/Iphone.png'
  },
  {
    id: '2',
    name: 'Jollof Rice, Chick...',
    sku: 'SKU-HDPHN-002',
    units: 150,
    views: 6088,
     image: '/Iphone.png'
  },
  {
    id: '3',
    name: 'Amazake Chicken...',
    sku: 'SKU-HDPHN-003',
    units: 147,
    views: 4609,
    image: '/Iphone.png'
  },
  {
    id: '4',
    name: 'Pepperoni & Chee...',
    sku: 'SKU-HDPHN-004',
    units: 122,
    views: 20220,
    image: '/Iphone.png'
  },
  {
    id: '5',
    name: 'Milky Vanilla Dou...',
    sku: 'SKU-HDPHN-005',
    units: 25,
    views: 9108,
     image: '/Iphone.png'
  }
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    name: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalViews = payload.find(p => p.dataKey === 'totalViews')?.value || 0;
    const avgViews = payload.find(p => p.dataKey === 'avgViewsPerDay')?.value || 0;

    return (
      <div className="bg-background border border-[#F5F5F5] dark:border-[#1F1F1F] rounded-lg shadow-lg p-4 min-w-[200px]">
        <p className="text-gray-500 text-sm mb-3">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span className="text-sm">{totalViews.toLocaleString()} • Total Views</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <span className="text-sm">{avgViews.toLocaleString()} • Avg. Views Per Day</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ViewPerformanceModal({ isOpen, onClose }: ViewPerformanceModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Max');
  const [searchTerm, setSearchTerm] = useState('');

  const periods = ['1D', '1W', '1M', '1Y', 'Max'];

  const filteredProducts = productsData.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className='flex flex-col items-start'>
          <DialogTitle className="text-sm font-semibold">View Performance</DialogTitle>
          <DialogDescription className="text-xs font-light text-gray-400 dark:text-gray-100">
            Select the data you&apos;d like to export and the format
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-6">

            {/* Chart and Products Section */}
            <div className="flex flex-col lg:flex-row gap-6">
                
              {/* Chart */}
              <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-semibold">Customer Segments</h3>
                <p className="text-xs text-gray-500 mt-1">An overview of your withdraw count and refund count.</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-background rounded-lg p-1">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedPeriod === period
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
                <div style={{ width: '100%', height: '400px' }}>
                    
                  <ResponsiveContainer>
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="none"
                        stroke="#f0f0f0"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        domain={[-60, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#6b7280', strokeWidth: 1 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalViews"
                        stroke="#42AA59"
                        strokeWidth={2}
                        dot={{ fill: '#42AA59', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 5, fill: '#42AA59', strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgViewsPerDay"
                        stroke="#C8F5D6"
                        strokeWidth={2}
                        dot={{ fill: '#C8F5D6', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 5, fill: '#C8F5D6', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-sm" />
                    <span>Total Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-200 rounded-sm" />
                    <span>Avg. Views Per Day</span>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="w-full lg:w-[350px]">
                <div className="relative mb-4">
                  <Input
                    type="text"
                    placeholder="Search by name/SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-green-500">{product.sku}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold">{product.units} units</p>
                        <p className="text-xs text-gray-500">{product.views.toLocaleString()} Views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">CSV</Button>
              <Button variant="outline" size="sm">PDF</Button>
              <Button variant="outline" size="sm">Excel</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" >
                    <Download/>
                    <span className="hidden sm:inline ml-2"> Download </span>
                  </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}