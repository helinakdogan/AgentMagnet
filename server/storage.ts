import { type User, type InsertUser, type Agent, type InsertAgent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAgent(id: string): Promise<Agent | undefined>;
  getAllAgents(): Promise<Agent[]>;
  getAgentsByCategory(category: string): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agents: Map<string, Agent>;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.seedAgents();
  }

  private seedAgents() {
    const sampleAgents: Agent[] = [
      {
        id: "1",
        name: "AI Yazım Asistanı",
        description: "Profesyonel içerik üretimi için gelişmiş dil modeli",
        category: "Yazım",
        price: 29,
        status: "active",
        iconColor: "blue-purple",
        features: ["Çok dilli destek", "Gramer kontrolü", "Stil önerileri", "Plagiarism kontrolü"],
        integrations: ["Google Docs", "Microsoft Word", "Notion", "WordPress"],
        isPopular: false,
      },
      {
        id: "2",
        name: "Görsel Oluşturucu",
        description: "Metinden profesyonel görseller oluşturun",
        category: "Görsel",
        price: 49,
        status: "popular",
        iconColor: "pink-orange",
        features: ["HD görsel üretimi", "Stil özelleştirme", "Batch işleme", "API entegrasyonu"],
        integrations: ["Photoshop", "Figma", "Canva", "Adobe Creative"],
        isPopular: true,
      },
      {
        id: "3",
        name: "Ses Sentezi",
        description: "Doğal ses üretimi ve dönüştürme",
        category: "Ses",
        price: 39,
        status: "new",
        iconColor: "green-teal",
        features: ["200+ ses seçeneği", "Duygu analizi", "Çok dilli", "Real-time işleme"],
        integrations: ["Spotify", "YouTube", "Podcast platforms", "Discord"],
        isPopular: false,
      },
      {
        id: "4",
        name: "Veri Analizi",
        description: "Akıllı veri analizi ve tahmin modelleri",
        category: "Analiz",
        price: 59,
        status: "trend",
        iconColor: "indigo-purple",
        features: ["Predictive analytics", "Real-time dashboards", "Custom reports", "ML algorithms"],
        integrations: ["Excel", "Tableau", "Power BI", "Google Analytics"],
        isPopular: false,
      },
      {
        id: "5",
        name: "Sohbet Botu",
        description: "Akıllı müşteri hizmetleri asistanı",
        category: "Sohbet",
        price: 35,
        status: "active",
        iconColor: "red-pink",
        features: ["24/7 destek", "Çok platform", "Öğrenme yeteneği", "Sentiment analysis"],
        integrations: ["WhatsApp", "Telegram", "Facebook Messenger", "Website"],
        isPopular: false,
      },
      {
        id: "6",
        name: "Kod Oluşturucu",
        description: "Otomatik kod yazımı ve optimizasyon",
        category: "Kod",
        price: 79,
        status: "pro",
        iconColor: "yellow-orange",
        features: ["Multi-language support", "Code review", "Bug detection", "Performance optimization"],
        integrations: ["VS Code", "GitHub", "GitLab", "IntelliJ"],
        isPopular: false,
      },
      {
        id: "7",
        name: "Çeviri Asistanı",
        description: "Çok dilli çeviri ve lokalizasyon",
        category: "Dil",
        price: 25,
        status: "active",
        iconColor: "cyan-blue",
        features: ["100+ dil", "Context-aware", "Cultural adaptation", "Real-time translation"],
        integrations: ["Google Translate", "DeepL", "Microsoft Translator", "Browser extensions"],
        isPopular: false,
      },
      {
        id: "8",
        name: "E-posta Otomasyonu",
        description: "Akıllı e-posta pazarlama ve takip",
        category: "Pazarlama",
        price: 45,
        status: "automatic",
        iconColor: "violet-purple",
        features: ["Smart segmentation", "A/B testing", "Analytics", "Personalization"],
        integrations: ["Mailchimp", "SendGrid", "Gmail", "Outlook"],
        isPopular: false,
      },
    ];

    sampleAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgentsByCategory(category: string): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.category.toLowerCase() === category.toLowerCase(),
    );
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = { ...insertAgent, id };
    this.agents.set(id, agent);
    return agent;
  }
}

export const storage = new MemStorage();
