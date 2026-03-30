import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Cpu, Zap, Activity, ShieldCheck, Loader2, Server } from 'lucide-react';
import { toast } from 'sonner';

export function EdgeDiagnostics() {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [sensorId, setSensorId] = useState('SN-7742-AGRI');

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/edge-diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData: { sensorId, timestamp: new Date().toISOString() } })
      });
      
      if (!response.ok) throw new Error('Edge worker unreachable');
      
      const data = await response.json();
      setDiagnostics(data.diagnostics);
      toast.success("Edge diagnostics completed via GKE worker.");
    } catch (error) {
      console.error("Diagnostics failed", error);
      toast.error("Failed to reach edge worker. Check GKE infrastructure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-50">Edge Diagnostics</h2>
          <p className="text-emerald-500/70">Hybrid infrastructure monitoring (GKE + FastAPI)</p>
        </div>
        <Cpu className="w-10 h-10 text-emerald-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#0d110d] border-emerald-900/30 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-emerald-50 flex items-center gap-2">
              <Server size={18} className="text-emerald-500" />
              Worker Config
            </CardTitle>
            <CardDescription className="text-emerald-500/50">Configure edge sensor parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sensor-id" className="text-emerald-500/70 text-xs uppercase font-bold">Sensor ID</Label>
              <Input 
                id="sensor-id" 
                value={sensorId} 
                onChange={(e) => setSensorId(e.target.value)}
                className="bg-emerald-900/10 border-emerald-900/30 text-emerald-50 focus:border-emerald-500"
              />
            </div>
            <div className="p-4 bg-emerald-900/10 rounded-lg border border-emerald-900/30 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-500/50">Endpoint</span>
                <span className="text-emerald-400 font-mono">gke.agri-mind.io/v1</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-500/50">Protocol</span>
                <span className="text-emerald-400 font-mono">gRPC / Secure</span>
              </div>
            </div>
            <Button 
              onClick={runDiagnostics} 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Ping Edge Worker'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#0d110d] border-emerald-900/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-emerald-50">Diagnostic Telemetry</CardTitle>
            <CardDescription className="text-emerald-500/50">Real-time feedback from GKE infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            {diagnostics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-900/10 rounded-xl border border-emerald-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <Zap size={16} className="text-amber-500" />
                      <span className="text-[10px] text-emerald-500/50 uppercase font-bold">Health Index</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-50">{diagnostics.healthIndex}%</p>
                  </div>
                  <div className="p-4 bg-emerald-900/10 rounded-xl border border-emerald-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <Activity size={16} className="text-emerald-500" />
                      <span className="text-[10px] text-emerald-500/50 uppercase font-bold">Latency</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-50">{diagnostics.latency}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-emerald-900/10 rounded-xl border border-emerald-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <ShieldCheck size={16} className="text-blue-500" />
                      <span className="text-[10px] text-emerald-500/50 uppercase font-bold">Model Drift</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-50">{diagnostics.modelDrift}</p>
                  </div>
                  <div className="p-4 bg-emerald-900/10 rounded-xl border border-emerald-900/30">
                    <p className="text-[10px] text-emerald-500/50 uppercase font-bold mb-2">Anomalies</p>
                    {diagnostics.anomalies.length > 0 ? (
                      <div className="space-y-1">
                        {diagnostics.anomalies.map((a: string, i: number) => (
                          <Badge key={i} variant="destructive" className="text-[10px]">{a}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-500/70 italic">No anomalies detected</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-emerald-900/50 border border-emerald-900/30 border-dashed rounded-xl">
                <Cpu size={32} className="mb-2" />
                <p>Initialize diagnostic sequence</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
