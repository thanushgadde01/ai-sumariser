import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PipelineStats } from '../types';
import { Activity, Clock, Database, Zap } from 'lucide-react';

interface MetricsPanelProps {
  stats: PipelineStats;
  history: { time: string; duration: number }[];
}

const StatCard = ({ icon: Icon, label, value, unit, color }: any) => (
  <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
    <div className={`p-3 rounded-lg bg-${color}-500/10`}>
      <Icon className={`w-5 h-5 text-${color}-500`} />
    </div>
    <div>
      <p className="text-gray-500 text-xs uppercase font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-100">
        {value}
        {unit && <span className="text-sm text-gray-500 ml-1 font-normal">{unit}</span>}
      </p>
    </div>
  </div>
);

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ stats, history }) => {
  // Mock data for the background activity chart if history is empty
  const chartData = history.length > 0 ? history : [
    { time: '10:00', duration: 0 },
    { time: '10:01', duration: 0 },
    { time: '10:02', duration: 0 },
    { time: '10:03', duration: 0 },
    { time: '10:04', duration: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="Throughput" value={stats.totalJobs} color="blue" />
        <StatCard icon={Clock} label="Avg Latency" value={stats.avgProcessingTime} unit="ms" color="yellow" />
        <StatCard icon={Database} label="Queue Depth" value={stats.queueDepth} color="orange" />
        <StatCard icon={Activity} label="Success Rate" value={stats.successRate} unit="%" color="green" />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-6">Processing Latency (ms)</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#374151" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#374151" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                itemStyle={{ color: '#a78bfa' }}
              />
              <Area 
                type="monotone" 
                dataKey="duration" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorDuration)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};