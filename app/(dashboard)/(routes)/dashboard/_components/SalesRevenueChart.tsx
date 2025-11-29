import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Define TypeScript interfaces
interface ChartDataItem {
  month: string;
  salesCount: number;
  revenueGrowth: number;
}

interface ApiResponseItem {
  label: string;
  sales_count: number;
  revenue: number;
}

interface ApiResponse {
  success: boolean;
  data: ApiResponseItem[];
  message?: string; // Add optional message property
}

const SalesRevenueChart = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('1Y');
    const [data, setData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState(false);

    const periods = ['1D', '1W', '1M', '1Y', 'Max'];

    // Fetch data from API
    const fetchData = async (period: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Remove storeId parameter - API gets it from cookies
            const response = await fetch(
                `/api/dashboard/chart?range=${period}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            
            const result: ApiResponse = await response.json();
            
            console.log('Chart API response:', result);
            
            if (result.success) {
                // Transform API data to match our chart format
                const chartData: ChartDataItem[] = result.data.map((item: ApiResponseItem) => ({
                    month: item.label,
                    salesCount: item.sales_count,
                    revenueGrowth: item.revenue
                }));
                setData(chartData);
            } else {
                console.error('Chart API error:', result.message);
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
            setData([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    };

    // Load data when component mounts or period changes
    useEffect(() => {
        fetchData(selectedPeriod);
    }, [selectedPeriod]);

    // Check if we have data to display
    const hasData = data && data.length > 0;

    return (
        <Card className="w-full shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-sm font-bold">
                            Sales Count vs Revenue Growth
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                            {loading ? 'Loading data...' : 'An overview of your sales count and revenue growth.'}
                        </p>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-background rounded-lg p-1">
                        {periods.map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                disabled={loading}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    selectedPeriod === period
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                } ${loading ? 'opacity-50' : ''}`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    {loading ? (
                        // Skeleton Loading State
                        <div className="h-full flex flex-col space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <div className="flex-1 flex items-end space-x-2">
                                {[...Array(12)].map((_, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                                        <Skeleton className="w-full" style={{ 
                                            height: `${Math.random() * 80 + 20}%`,
                                            maxHeight: '200px'
                                        }} />
                                        <Skeleton className="h-3 w-8" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ) : !hasData ? (
                        // No Data Available State
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="text-gray-400 mb-2">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">No data available</p>
                            <p className="text-gray-400 text-xs mt-1">Try selecting a different time period</p>
                        </div>
                    ) : (
                        // Chart with Data
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{
                                        top: 20,
                                        bottom: 5,
                                    }}
                                    barCategoryGap="20%"
                                >
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
                                <div className='flex gap-3 items-center'>
                                    <span className='w-2 h-2 bg-[#5BA3F8] rounded-full' />
                                    <span className='text-xs'>Sales Count</span>
                                </div>
                                <div className='flex gap-3 items-center'>
                                    <span className='w-2 h-2 bg-[#42AA59] rounded-full' />
                                    <span className='text-xs'>Revenue Growth</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default SalesRevenueChart;