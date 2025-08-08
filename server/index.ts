import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleInfoDaily, handleMarketInsights } from "./routes/infodaily";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware de debug para API calls
app.use("/api", (req, res, next) => {
  console.log(`🌐 API Request: ${req.method} ${req.originalUrl}`);
  console.log("🔗 Headers:", req.headers);
  console.log("🎯 User-Agent:", req.headers['user-agent']);
  console.log("📨 Content-Type:", req.headers['content-type']);
  console.log("🔐 Authorization:", req.headers['authorization'] ? 'Present' : 'None');
  
  // Log body para POST/PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log("📦 Body:", req.body);
  }
  
  next();
});

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // InfoDaily routes
  app.get("/api/infodaily/", handleInfoDaily);
  app.get("/api/insights-mercado/", handleMarketInsights);

  return app;
}
