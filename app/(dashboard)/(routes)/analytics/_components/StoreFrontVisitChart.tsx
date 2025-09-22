import StoreVisit from '@/components/svgIcons/StoreVisit';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface VisitData {
  name: string;
  pastVisits: number;
  activeVisits: number;
  inactiveVisits: number;
}

const data: VisitData[] = [
  { name: 'Mon', pastVisits: 10000, activeVisits: 0, inactiveVisits: 0 },
  { name: 'Tue', pastVisits: 4000, activeVisits: 0, inactiveVisits: 0 },
  { name: 'Wed', pastVisits: 0, activeVisits: 3000, inactiveVisits: 0 },
  { name: 'Thu', pastVisits: 0, activeVisits: 0, inactiveVisits: 0 },
  { name: 'Fri', pastVisits: 0, activeVisits: 0, inactiveVisits: 0 },
  { name: 'Sat', pastVisits: 0, activeVisits: 0, inactiveVisits: 0 },
  { name: 'Sun', pastVisits: 0, activeVisits: 0, inactiveVisits: 0 },
];

const StorefrontVisitsChart: React.FC = () => {
  return (
    <>
    <div className='flex items-center justify-between mx-5'>
      <div className='flex items-center gap-3'> <StoreVisit/> 
      <div className='flex flex-col justify-between'>
        <p className='text-lg font-light'>7200</p>
        <span className='text-primary text-xs'>-8,72% vs. previous</span>
      </div>
      </div>
     <p className='text-xs'>Total Storefront Visit per day</p>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="pastVisits" fill="#42AA59" name="Past Visits" />
        <Bar dataKey="activeVisits" fill="#D1FFDB" name="Active Visits" />
        <Bar dataKey="inactiveVisits" fill="#F5F5F5" name="Inactive Visits" />
      </BarChart>
    </ResponsiveContainer>
    <div className='flex items-center justify-center gap-2 text-xs font-light'>
      <div className='flex items-center gap-1'><span className='w-3 h-3 bg-[#42AA59] rounded-xs'/> <p>Past Visits</p></div>
      <div className='flex items-center gap-1'><span className='w-3 h-3 bg-[#D1FFDB] rounded-xs'/><p>Active Visits</p></div>
      <div className='flex items-center gap-1'><span className='w-3 h-3 bg-[#F5F5F5] rounded-xs'/> <p>Inactive Visits</p></div>
    </div>
    </>
  )
};

export default StorefrontVisitsChart;