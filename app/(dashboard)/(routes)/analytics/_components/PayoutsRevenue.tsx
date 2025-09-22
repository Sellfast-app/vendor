import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

interface ChartData {
  month: string;
  withdrawalCount: number;
  refundCount: number;
  withdrawalAmount: number;
  refundAmount: number;
}

const data: ChartData[] = [
  { month: 'Jan', withdrawalCount: 59, refundCount: 12, withdrawalAmount: 1800000, refundAmount: 950000 },
  { month: 'Feb', withdrawalCount: 8, refundCount: 26, withdrawalAmount: 1850000, refundAmount: 980000 },
  { month: 'Mar', withdrawalCount: 4, refundCount: 24, withdrawalAmount: 1900000, refundAmount: 970000 },
  { month: 'Apr', withdrawalCount: 17, refundCount: 8, withdrawalAmount: 2010090, refundAmount: 998075.40 },
  { month: 'May', withdrawalCount: 48, refundCount: -18, withdrawalAmount: 2100000, refundAmount: 890000 },
  { month: 'Jun', withdrawalCount: 45, refundCount: -42, withdrawalAmount: 2200000, refundAmount: 850000 },
  { month: 'Jul', withdrawalCount: 29, refundCount: -45, withdrawalAmount: 2250000, refundAmount: 800000 },
  { month: 'Aug', withdrawalCount: -12, refundCount: -35, withdrawalAmount: 2180000, refundAmount: 820000 },
  { month: 'Sep', withdrawalCount: -8, refundCount: -38, withdrawalAmount: 2150000, refundAmount: 840000 },
  { month: 'Oct', withdrawalCount: 4, refundCount: 28, withdrawalAmount: 2300000, refundAmount: 950000 },
  { month: 'Nov', withdrawalCount: 28, refundCount: 45, withdrawalAmount: 2400000, refundAmount: 1100000 },
  { month: 'Dec', withdrawalCount: 28, refundCount: 72, withdrawalAmount: 2450000, refundAmount: 1200000 }
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px]">
        <p className="text-gray-500 text-sm mb-3">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-sm font-medium">120 • ₦2,010,090.00 • Withdrawal Count</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">17 • ₦998,075.40 • Refund Count</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const formatYAxisLeft = (value: number): string => {
  return value.toString();
};

const formatYAxisRight = (value: number): string => {
  return value.toString();
};

export default function WithdrawalsVsRefunds() {
  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Withdrawals vs Refunds</h2>
            <p className="text-xs text-gray-500">An overview of your withdraw count and refund count.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs text-gray-400 hover:text-gray-600">1D</button>
            <button className="px-3 py-1 text-xs text-gray-400 hover:text-gray-600">1W</button>
            <button className="px-3 py-1 text-xs text-gray-400 hover:text-gray-600">1M</button>
            <button className="px-3 py-1 text-xs text-gray-400 hover:text-gray-600">1Y</button>
            <button className="px-3 py-1 text-xs text-gray-900 font-medium border-b-2 border-gray-900">Max</button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className=" py-4">
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
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
                yAxisId="left"
                domain={[-60, 80]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={formatYAxisLeft}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                domain={[-60, 80]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={formatYAxisRight}
              />
              
              {/* Vertical line at April */}
              <Line
                yAxisId="left"
                dataKey={() => null}
                stroke="transparent"
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#6b7280', strokeWidth: 1 }}
                position={{ x: 400, y: 200 }}
              />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="withdrawalCount"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ fill: '#60a5fa', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 5, fill: '#60a5fa', strokeWidth: 0 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="refundCount"
                stroke="#4ade80"
                strokeWidth={2}
                dot={{ fill: '#4ade80', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 5, fill: '#4ade80', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-400 rounded-xs"/>
            <span>Sales Count</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-400 rounded-xs "/>
            <span>Revenue Growth</span>
          </div>
        </div>
      </div>
    </div>
  );
}