import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock Edge Diagnostics API
  app.post("/api/edge-diagnostics", (req, res) => {
    const { sensorData } = req.body;
    console.log("Received sensor data for edge diagnostics:", sensorData);
    
    // Simulate FastAPI worker logic
    const latency = Math.floor(Math.random() * 50) + 10; // 10-60ms
    const drift = (Math.random() * 0.05).toFixed(4);
    
    res.json({
      status: "success",
      diagnostics: {
        healthIndex: (Math.random() * 100).toFixed(2),
        anomalies: Math.random() > 0.8 ? ["Moisture stress detected"] : [],
        latency: `${latency}ms`,
        modelDrift: drift,
        workerId: "gke-fastapi-worker-01"
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Agri-Mind Orchestrator Server running on http://localhost:${PORT}`);
  });
}

startServer();
