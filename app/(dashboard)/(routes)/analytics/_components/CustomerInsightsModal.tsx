"use client";

import React, { JSX, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import MapView from '@/components/MapView';

interface ChartData {
  month: string;
  newCustomers: number;
  repeatCustomers: number;
  churnedCustomers: number;
}

interface LocationData {
  id: string;
  name: string;
  count: number;
  percentage: number;
  flag: JSX.Element;
  coordinates: [number, number];
}

interface CustomerInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationData: LocationData[];
}

const chartData: ChartData[] = [
  { month: 'Jan', newCustomers: 59, repeatCustomers: 12, churnedCustomers: -60 },
  { month: 'Feb', newCustomers: 8, repeatCustomers: 26, churnedCustomers: -55 },
  { month: 'Mar', newCustomers: 4, repeatCustomers: 24, churnedCustomers: -45 },
  { month: 'Apr', newCustomers: 50, repeatCustomers: 35, churnedCustomers: -15 },
  { month: 'May', newCustomers: 48, repeatCustomers: -18, churnedCustomers: -35 },
  { month: 'Jun', newCustomers: 45, repeatCustomers: -42, churnedCustomers: -25 },
  { month: 'Jul', newCustomers: 29, repeatCustomers: -45, churnedCustomers: -15 },
  { month: 'Aug', newCustomers: -12, repeatCustomers: -35, churnedCustomers: -45 },
  { month: 'Sep', newCustomers: -8, repeatCustomers: -38, churnedCustomers: -55 },
  { month: 'Oct', newCustomers: 4, repeatCustomers: 28, churnedCustomers: -35 },
  { month: 'Nov', newCustomers: 28, repeatCustomers: 45, churnedCustomers: 10 },
  { month: 'Dec', newCustomers: 80, repeatCustomers: 72, churnedCustomers: -10 }
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
    // const data = payload[0];
    
    return (
      <div className="bg-background border border-[#F5F5F5] dark:border-[#1F1F1F] rounded-lg shadow-lg p-4 min-w-[280px]">
        <p className="text-gray-500 text-sm mb-3">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-sm">256 • 50% • New Customers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm">56 • 35% • Repeat Customers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-sm">14 • 15% • Churned Customers</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function CustomerInsightsModal({ isOpen, onClose, locationData }: CustomerInsightsModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Max');
  const [showMap, setShowMap] = useState(false);

  const periods = ['1D', '1W', '1M', '1Y', 'Max'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Customer Insights</DialogTitle>
          <DialogDescription className="text-xs font-light text-gray-400 dark:text-gray-100">
            Select the data you&apos;d like to export and the format
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {!showMap ? (
            // Chart View
            <div>
              <div className="mb-6">

                {/* Chart */}
                <div className="flex flex-col md:flex-row gap-6 items-center ">
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
                            dataKey="newCustomers"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            dot={{ fill: '#60a5fa', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 5, fill: '#60a5fa', strokeWidth: 0 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="repeatCustomers"
                            stroke="#4ade80"
                            strokeWidth={2}
                            dot={{ fill: '#4ade80', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 5, fill: '#4ade80', strokeWidth: 0 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="churnedCustomers"
                            stroke="#f87171"
                            strokeWidth={2}
                            dot={{ fill: '#f87171', strokeWidth: 0, r: 4 }}
                            strokeDasharray="5 5"
                            activeDot={{ r: 5, fill: '#f87171', strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-400 rounded-sm" />
                        <span>New Customers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-400 rounded-sm" />
                        <span>Repeat Customers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-400 rounded-sm" />
                        <span>Churned Customers</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="w-[300px] space-y-4">
                    <div className='flex gap-3 justify-between border border-[#F5F5F5] dark:border-[#1F1F1F] rounded-xl p-3'>
                         <div className="space-y-1">
                      <div className="text-xs text-gray-500">Total Customers</div>
                      <div className="text-2xl font-semibold">2,948</div>
                      <div className="text-xs text-green-500">-1.2% vs. previous</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Active Customers</div>
                      <div className="text-2xl font-semibold">1,700</div>
                      <div className="text-xs text-green-500">-1.2% vs. previous</div>
                    </div>
                    </div>
                   

                    <div className="space-y-3 pt-4 border-t">
                      {locationData.map((location) => (
                        <div key={location.id} className="flex items-center gap-3">
                          {location.flag}
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{location.name}</span>
                              <span className="font-medium">{location.count} • {location.percentage}%</span>
                            </div>
                            <Progress value={location.percentage} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full text-green-500 hover:text-green-600 mt-4"
                      onClick={() => setShowMap(true)}
                    >
                      See In Map →
                    </Button>
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
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                    Download Data
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Map View
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="mb-4"
                onClick={() => setShowMap(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chart
              </Button>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden border">
                  <MapView locations={locationData} />
                </div>

                <div className="w-[300px] space-y-3">
                  {locationData.map((location) => (
                    <div key={location.id} className="flex items-center gap-3">
                      {location.flag}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{location.name}</span>
                          <span className="font-medium">{location.count} • {location.percentage}%</span>
                        </div>
                        <Progress value={location.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">CSV</Button>
                  <Button variant="outline" size="sm">PDF</Button>
                  <Button variant="outline" size="sm">Excel</Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button >
                    Download Data
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}