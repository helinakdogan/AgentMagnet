import type { Express } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";

// Backend API base URL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Proxy all API requests to the backend
  app.use("/api/*", async (req, res) => {
    try {
      const targetUrl = `${BACKEND_URL}${req.originalUrl}`;
      
      // Prepare headers - preserve cookies and session info
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      // Copy all headers except host
      Object.keys(req.headers).forEach(key => {
        if (key.toLowerCase() !== 'host') {
          headers[key] = req.headers[key];
        }
      });
      
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      });

      // Copy response headers (especially Set-Cookie)
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(response.status).send(text);
      }
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ 
        message: "Failed to connect to backend service",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
