import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SalesRevenueChart = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Max');

    const data = [
        { month: 'Jan', salesCount: 70, revenueGrowth: 42 },
        { month: 'Feb', salesCount: 17, revenueGrowth: 52 },
        { month: 'Mar', salesCount: 35, revenueGrowth: 32 },
        { month: 'Apr', salesCount: 20, revenueGrowth: 82 },
        { month: 'May', salesCount: 42, revenueGrowth: 15 },
        { month: 'Jun', salesCount: 12, revenueGrowth: 15 },
        { month: 'Jul', salesCount: 53, revenueGrowth: 53 },
        { month: 'Aug', salesCount: 16, revenueGrowth: 37 },
        { month: 'Sep', salesCount: 57, revenueGrowth: 95 },
        { month: 'Oct', salesCount: 52, revenueGrowth: 95 },
        { month: 'Nov', salesCount: 93, revenueGrowth: 53 },
        { month: 'Dec', salesCount: 42, revenueGrowth: 13 }
    ];

    const periods = ['1D', '1W', '1M', '1Y', 'Max'];

    return (
        <Card className="w-full shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-sm font-bold">
                            Sales Count vs Revenue Growth
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                            An overview of your sales count and revenue growth.
                        </p>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {periods.map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedPeriod === period
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                bottom: 5,
                            }}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                domain={[0, 100]}
                            />
                            {/* <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '14px'
                }}
                iconType="rect"
              /> */}
                            <Bar
                                dataKey="salesCount"
                                name="Sales Count"
                                fill="#5BA3F8"
                                radius={[2, 2, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                dataKey="revenueGrowth"
                                name="Revenue Growth"
                                fill="#42AA59"
                                radius={[2, 2, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className='flex items-center justify-center gap-4'>
                        <div className='flex gap-3 items-center'><span className=' w-2 h-2 bg-[#5BA3F8] p-1' /> <span className='text-xs'>Sales Count</span></div>
                        <div className='flex gap-3  items-center'><span className=' w-2 h-2 bg-[#42AA59] p-1' /> <span className='text-xs'> Revenue Growth</span></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SalesRevenueChart;