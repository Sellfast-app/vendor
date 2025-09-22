import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

interface ChartData {
  month: string;
  inflowCount: number;
  outflowCount: number;
  inflowAmount: number;
  outflowAmount: number;
}

const data: ChartData[] = [
  { month: 'Jan', inflowCount: 59, outflowCount: 12, inflowAmount: 1800000, outflowAmount: 950000 },
  { month: 'Feb', inflowCount: 8, outflowCount: 26, inflowAmount: 1850000, outflowAmount: 980000 },
  { month: 'Mar', inflowCount: 4, outflowCount: 24, inflowAmount: 1900000, outflowAmount: 970000 },
  { month: 'Apr', inflowCount: 17, outflowCount: 8, inflowAmount: 2010090, outflowAmount: 998075.40 },
  { month: 'May', inflowCount: 48, outflowCount: -18, inflowAmount: 2100000, outflowAmount: 890000 },
  { month: 'Jun', inflowCount: 45, outflowCount: -42, inflowAmount: 2200000, outflowAmount: 850000 },
  { month: 'Jul', inflowCount: 29, outflowCount: -45, inflowAmount: 2250000, outflowAmount: 800000 },
  { month: 'Aug', inflowCount: -12, outflowCount: -35, inflowAmount: 2180000, outflowAmount: 820000 },
  { month: 'Sep', inflowCount: -8, outflowCount: -38, inflowAmount: 2150000, outflowAmount: 840000 },
  { month: 'Oct', inflowCount: 4, outflowCount: 28, inflowAmount: 2300000, outflowAmount: 950000 },
  { month: 'Nov', inflowCount: 28, outflowCount: 45, inflowAmount: 2400000, outflowAmount: 1100000 },
  { month: 'Dec', inflowCount: 28, outflowCount: 72, inflowAmount: 2450000, outflowAmount: 1200000 }
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
            <div className="w-3 h-3 bg-[#4FCA6A] rounded-full"></div>
            <span className="text-sm font-medium">120 • ₦2,010,090.00 • Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#E80000] rounded-full"></div>
            <span className="text-sm font-medium">17 • ₦998,075.40 • Outflow</span>
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

export default function TransactionInflowChart() {
  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Transaction Inflow vs Outflow</h2>
            <p className="text-xs text-gray-500">An overview of your sales count and revenue growth.</p>
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
                dataKey="inflowCount"
                stroke="#4FCA6A"
                strokeWidth={2}
                dot={{ fill: '#4FCA6A', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 5, fill: '#4FCA6A', strokeWidth: 0 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="outflowCount"
                stroke="#E80000"
                strokeWidth={2}
                dot={{ fill: '#E80000', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 5, fill: '#E80000', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#4FCA6A] rounded-xs"/>
            <span>Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#E80000] rounded-xs "/>
            <span>Outflow</span>
          </div>
        </div>
      </div>
    </div>
  );
}