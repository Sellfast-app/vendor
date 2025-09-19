import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="pastVisits" fill="#4CAF50" name="Past Visits" />
        <Bar dataKey="activeVisits" fill="#C8E6C9" name="Active Visits" />
        <Bar dataKey="inactiveVisits" fill="#E0E0E0" name="Inactive Visits" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StorefrontVisitsChart;