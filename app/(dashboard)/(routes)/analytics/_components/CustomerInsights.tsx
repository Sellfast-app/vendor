import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

const CustomerSegmentsChart = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Max');
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

    // Data for bar chart (monthly data)
    const barData = [
        { month: 'Jan', whatsapp: 42, storefront: 70 },
        { month: 'Feb', whatsapp: 50, storefront: 17 },
        { month: 'Mar', whatsapp: 35, storefront: 32 },
        { month: 'Apr', whatsapp: 82, storefront: 20 },
        { month: 'May', whatsapp: 15, storefront: 42 },
        { month: 'Jun', whatsapp: 15, storefront: 12 },
        { month: 'Jul', whatsapp: 53, storefront: 57 },
        { month: 'Aug', whatsapp: 35, storefront: 15 },
        { month: 'Sep', whatsapp: 95, storefront: 57 },
        { month: 'Oct', whatsapp: 95, storefront: 52 },
        { month: 'Nov', whatsapp: 53, storefront: 93 },
        { month: 'Dec', whatsapp: 13, storefront: 42 }
    ];

    // Data for pie/donut chart (customer segments)
    const pieData = [
        { name: 'New Customers', value: 50, color: '#5BA3F8' },
        { name: 'Repeat Customers', value: 35, color: '#42AA59' },
        { name: 'Churned Customers', value: 15, color: '#E74C3C' }
    ];

    const periods = ['1D', '1W', '1M', '1Y', 'Max'];

    // Custom label for pie chart to show percentage inside
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderLabel = (entry: any) => {
        return `${entry.value}%`;
    };

    return (
        <Card className="w-full shadow-none border-0">
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-sm font-bold">
                            Customer Segments
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                            An overview of your withdraw count and refund count.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* Time period selector */}
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

                        {/* Chart type selector */}
                        <button
                            onClick={() => setChartType('pie')}
                            className={`p-2 rounded-lg transition-colors ${
                                chartType === 'pie'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 dark:bg-background text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <PieChartIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`p-2 rounded-lg transition-colors ${
                                chartType === 'bar'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 dark:bg-background text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <BarChart3 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    {chartType === 'pie' ? (
                        // Pie/Donut Chart View
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col md:flex-row items-center md:gap-10">
                                <ResponsiveContainer width={400} height={400}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={100}
                                            outerRadius={150}
                                            paddingAngle={0}
                                            dataKey="value"
                                            label={renderLabel}
                                            labelLine={false}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-row md:flex-col gap-4">
                                    {pieData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <span
                                                className="w-3 h-3 rounded-sm"
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span className="text-xs md:text-sm text-gray-600">{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Bar Chart View
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={barData}
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
                                        dataKey="storefront"
                                        name="Storefront"
                                        fill="#5BA3F8"
                                        radius={[2, 2, 0, 0]}
                                        maxBarSize={40}
                                    />
                                    <Bar
                                        dataKey="whatsapp"
                                        name="WhatsApp"
                                        fill="#42AA59"
                                        radius={[2, 2, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <div className="flex gap-3 items-center">
                                    <span className="w-2 h-2 bg-[#42AA59] p-1" />
                                    <span className="text-xs">WhatsApp</span>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <span className="w-2 h-2 bg-[#5BA3F8] p-1" />
                                    <span className="text-xs">Storefront</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CustomerSegmentsChart;