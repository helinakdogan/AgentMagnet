import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const category = req.query.category as string;
      let agents;
      
      if (category && category !== "Tümü") {
        agents = await storage.getAgentsByCategory(category);
      } else {
        agents = await storage.getAllAgents();
      }
      
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  // GET single agent by ID
  app.get("/api/agents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const agent = await storage.getAgent(id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
