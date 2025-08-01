import type { Express } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch"; // 👈 Eğer node-fetch kurulu değilse: npm i node-fetch

export async function registerRoutes(app: Express): Promise<Server> {
  // GET all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const category = req.query.category as string;
      const backendUrl = new URL("http://localhost:3000/api/agents");

      if (category && category !== "Tümü") {
        backendUrl.searchParams.set("category", category);
      }

      const response = await fetch(backendUrl.toString());
      const agents = await response.json();

      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents from backend" });
    }
  });

  // GET single agent by ID
  app.get("/api/agents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(`http://localhost:3000/api/agents/${id}`);
      const agent = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(agent);
      }

      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent from backend" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
