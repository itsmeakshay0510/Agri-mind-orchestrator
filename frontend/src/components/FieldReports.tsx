import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { db, auth, collection, query, where, onSnapshot, orderBy } from '../firebase';
import { FileText, Calendar, MapPin, Search } from 'lucide-react';
import { Input } from './ui/input';

export function FieldReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'fieldReports'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredReports = reports.filter(r => 
    r.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.healthStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-emerald-50">Field Reports</h2>
          <p className="text-emerald-500/70">Historical crop health and analysis records</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50" size={16} />
          <Input 
            placeholder="Search reports..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-emerald-900/10 border-emerald-900/30 text-emerald-50 focus:border-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-emerald-900/10 rounded-xl animate-pulse" />)}
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="bg-[#0d110d] border-emerald-900/30 overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={report.imageUrl} 
                  alt="Field" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={`
                    ${report.healthStatus === 'Healthy' ? 'bg-emerald-500 text-white' : 
                      report.healthStatus === 'Stressed' ? 'bg-amber-500 text-white' : 
                      'bg-red-500 text-white'}
                  `}>
                    {report.healthStatus}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg text-emerald-50">{report.cropType}</CardTitle>
                <div className="flex items-center gap-4 text-xs text-emerald-500/50">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(report.timestamp).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    Sector 7G
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-emerald-100/60 line-clamp-2 italic">
                  "{report.analysisResult}"
                </p>
                <div className="mt-4 pt-4 border-t border-emerald-900/30 flex justify-between items-center">
                  <span className="text-[10px] text-emerald-500/30 uppercase font-bold">Confidence</span>
                  <span className="text-xs text-emerald-400">{(report.confidenceScore * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-emerald-900/50 border border-emerald-900/30 border-dashed rounded-xl">
          <FileText size={48} className="mb-4" />
          <p className="text-lg font-medium">No reports found</p>
          <p className="text-sm">Run a satellite analysis to generate your first report.</p>
        </div>
      )}
    </div>
  );
}
