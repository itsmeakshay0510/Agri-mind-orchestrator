import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Upload, Satellite, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI } from '@google/genai';
import { db, auth, collection, addDoc, serverTimestamp } from '../firebase';
import { toast } from 'sonner';

export function SatelliteAnalysis() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const runAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Analyze this agricultural image. Identify the crop type, health status (Healthy, Stressed, Diseased), and provide a brief technical summary of patterns observed. Return the result in JSON format with keys: cropType, healthStatus, summary, confidenceScore." },
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      const analysis = JSON.parse(response.text);
      setResult(analysis);

      // Save to Firebase
      if (auth.currentUser) {
        await addDoc(collection(db, 'fieldReports'), {
          userId: auth.currentUser.uid,
          timestamp: new Date().toISOString(),
          cropType: analysis.cropType,
          healthStatus: analysis.healthStatus,
          analysisResult: analysis.summary,
          imageUrl: image, // In a real app, upload to Storage first
          confidenceScore: analysis.confidenceScore,
          createdAt: serverTimestamp()
        });
        toast.success("Analysis complete and report saved.");
      }
    } catch (error) {
      console.error("Analysis failed", error);
      toast.error("Analysis failed. Please check your API key or image quality.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-50">Satellite Analysis</h2>
          <p className="text-emerald-500/70">Multimodal crop health identification via Gemini AI</p>
        </div>
        <Satellite className="w-10 h-10 text-emerald-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#0d110d] border-emerald-900/30">
          <CardHeader>
            <CardTitle className="text-emerald-50 flex items-center gap-2">
              <Upload size={18} className="text-emerald-500" />
              Image Upload
            </CardTitle>
            <CardDescription className="text-emerald-500/50">Upload field imagery for processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              {...getRootProps()} 
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-emerald-900/30 hover:border-emerald-500/50 hover:bg-emerald-900/10'}
              `}
            >
              <input {...getInputProps()} />
              {image ? (
                <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-2xl" />
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-emerald-500/70">Drag & drop or click to select satellite imagery</p>
                </div>
              )}
            </div>
            <Button 
              onClick={runAnalysis} 
              disabled={!image || analyzing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Orchestrating AI Analysis...
                </>
              ) : (
                'Run Multimodal Analysis'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#0d110d] border-emerald-900/30">
          <CardHeader>
            <CardTitle className="text-emerald-50">Analysis Results</CardTitle>
            <CardDescription className="text-emerald-500/50">Real-time intelligence output</CardDescription>
          </CardHeader>
          <CardContent>
            {analyzing ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px] bg-emerald-900/20" />
                <Skeleton className="h-4 w-[200px] bg-emerald-900/20" />
                <Skeleton className="h-20 w-full bg-emerald-900/20" />
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-emerald-500/50 uppercase tracking-wider font-bold">Crop Type</p>
                    <p className="text-xl font-bold text-emerald-50">{result.cropType}</p>
                  </div>
                  <Badge className={`
                    px-3 py-1 text-xs font-bold
                    ${result.healthStatus === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                      result.healthStatus === 'Stressed' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                      'bg-red-500/20 text-red-400 border-red-500/30'}
                  `}>
                    {result.healthStatus}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-emerald-500/50 uppercase tracking-wider font-bold">Technical Summary</p>
                  <div className="p-4 bg-emerald-900/10 rounded-lg border border-emerald-900/30 text-sm leading-relaxed text-emerald-100/80">
                    {result.summary}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-500/50">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Confidence Score: {(result.confidenceScore * 100).toFixed(1)}%
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-emerald-900/50">
                <AlertCircle size={32} className="mb-2" />
                <p>Awaiting input imagery</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
