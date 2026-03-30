import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Activity, BarChart3, TrendingUp, ShieldAlert } from 'lucide-react';

const latencyData = [
  { time: '00:00', value: 42 },
  { time: '04:00', value: 38 },
  { time: '08:00', value: 55 },
  { time: '12:00', value: 48 },
  { time: '16:00', value: 45 },
  { time: '20:00', value: 52 },
  { time: '23:59', value: 40 },
];

const driftData = [
  { time: 'Day 1', value: 0.01 },
  { time: 'Day 2', value: 0.012 },
  { time: 'Day 3', value: 0.015 },
  { time: 'Day 4', value: 0.022 },
  { time: 'Day 5', value: 0.018 },
  { time: 'Day 6', value: 0.025 },
  { time: 'Day 7', value: 0.031 },
];

export function MLOpsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-50">MLOps Dashboard</h2>
          <p className="text-emerald-500/70">Production-grade model monitoring and drift analysis</p>
        </div>
        <BarChart3 className="w-10 h-10 text-emerald-500/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Model Accuracy" value="98.4%" trend="+0.2%" icon={<TrendingUp size={16} />} />
        <StatCard title="Avg Latency" value="45ms" trend="-2ms" icon={<Activity size={16} />} />
        <StatCard title="Daily Inferences" value="1.2M" trend="+12k" icon={<BarChart3 size={16} />} />
        <StatCard title="Active Alerts" value="0" trend="Stable" icon={<ShieldAlert size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#0d110d] border-emerald-900/30">
          <CardHeader>
            <CardTitle className="text-emerald-50 text-sm font-bold uppercase tracking-wider">Inference Latency (ms)</CardTitle>
            <CardDescription className="text-emerald-500/50">24-hour performance window</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" vertical={false} />
                <XAxis dataKey="time" stroke="#3d5c3d" fontSize={10} />
                <YAxis stroke="#3d5c3d" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d110d', border: '1px solid #064e3b', color: '#ecfdf5' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#0d110d] border-emerald-900/30">
          <CardHeader>
            <CardTitle className="text-emerald-50 text-sm font-bold uppercase tracking-wider">Model Concept Drift</CardTitle>
            <CardDescription className="text-emerald-500/50">7-day statistical deviation</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={driftData}>
                <defs>
                  <linearGradient id="colorDrift" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" vertical={false} />
                <XAxis dataKey="time" stroke="#3d5c3d" fontSize={10} />
                <YAxis stroke="#3d5c3d" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d110d', border: '1px solid #064e3b', color: '#ecfdf5' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorDrift)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <Card className="bg-[#0d110d] border-emerald-900/30">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] text-emerald-500/50 uppercase font-bold tracking-wider">{title}</p>
          <p className="text-xl font-bold text-emerald-50">{value}</p>
          <p className="text-[10px] text-emerald-400 font-medium">{trend}</p>
        </div>
        <div className="w-10 h-10 bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-500">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
