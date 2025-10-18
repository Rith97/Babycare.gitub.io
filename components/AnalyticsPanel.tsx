
import React, { useMemo } from 'react';
import { FeedRecord, SleepRecord } from '../types';

// FIX: Declare the Recharts property on the global Window object to fix TypeScript error.
// This is necessary because Recharts is likely loaded from a script tag, not as an ES module.
declare global {
  interface Window {
    Recharts: any;
  }
}

// FIX: Defined the missing AnalyticsPanelProps interface.
interface AnalyticsPanelProps {
  feedRecords: FeedRecord[];
  sleepRecords: SleepRecord[];
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
        <p className="label font-bold text-indigo-500">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toFixed(1)} ${pld.dataKey === 'sleep' ? 'hours' : 'ml'}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ feedRecords, sleepRecords }) => {
  const feedByDay = useMemo(() => {
    const data: { [key: string]: number } = {};
    feedRecords.forEach(r => {
      const day = new Date(r.dateTime).toLocaleDateString();
      if (!data[day]) data[day] = 0;
      data[day] += r.amount || 0;
    });
    return Object.entries(data).map(([name, amount]) => ({ name, amount })).slice(-30); // Last 30 days
  }, [feedRecords]);

  const sleepByDay = useMemo(() => {
    const data: { [key: string]: number } = {};
    sleepRecords.forEach(r => {
      const day = new Date(r.startTime).toLocaleDateString();
      const duration = (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / (1000 * 60 * 60);
      if (!data[day]) data[day] = 0;
      data[day] += duration > 0 ? duration : 0;
    });
    return Object.entries(data).map(([name, sleep]) => ({ name, sleep })).slice(-30);
  }, [sleepRecords]);

  const feedTypeDistribution = useMemo(() => {
    const data: { [key: string]: number } = {};
     feedRecords.forEach(r => {
      if (!data[r.type]) data[r.type] = 0;
      data[r.type]++;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [feedRecords]);

  // Check if Recharts is loaded.
  if (!window.Recharts) {
    return (
        <section className="card">
            <h3 className="text-xl sm:text-2xl font-bold mb-6">📊 ក្រាហ្វវិភាគ</h3>
            <div className="text-center py-10">Loading charts...</div>
        </section>
    );
  }

  const { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } = window.Recharts;

  return (
    <section className="card">
      <h3 className="text-xl sm:text-2xl font-bold mb-6">📊 ក្រាហ្វវិភាគ</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="col-span-1 lg:col-span-2">
            <h4 className="text-xl font-semibold mb-4 text-center">បរិមាណបំបៅប្រចាំថ្ងៃ (ml)</h4>
            {feedRecords.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={feedByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)"/>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            ) : <p className="text-center text-gray-500 p-8">គ្មានទិន្នន័យបំបៅ</p>}
        </div>

        <div>
            <h4 className="text-xl font-semibold mb-4 text-center">រយៈពេលគេងប្រចាំថ្ងៃ (ម៉ោង)</h4>
             {sleepRecords.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sleepByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)"/>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="sleep" fill="#ec4899" />
                    </BarChart>
                </ResponsiveContainer>
             ) : <p className="text-center text-gray-500 p-8">គ្មានទិន្នន័យការគេង</p>}
        </div>

        <div>
            <h4 className="text-xl font-semibold mb-4 text-center">ប្រភេទការបំបៅ</h4>
             {feedRecords.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie data={feedTypeDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {feedTypeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
             ) : <p className="text-center text-gray-500 p-8">គ្មានទិន្នន័យបំបៅ</p>}
        </div>

      </div>
    </section>
  );
};

export default AnalyticsPanel;