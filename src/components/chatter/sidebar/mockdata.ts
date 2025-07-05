import { Plus, MessageCircle, FileText } from "lucide-react";

export interface ChatItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'chat' | 'artifact';
}

export interface SidebarData {
  user: {
    name: string;
    email: string;
  };
  recentChats: ChatItem[];
  artifacts: ChatItem[];
}

export const sidebarData: SidebarData = {
  user: {
    name: "alkush pipania",
    email: "Free plan"
  },
  recentChats: [
    {
      id: "1",
      title: "NextJS Azure Deployment Error",
      timestamp: "2 hours ago",
      type: "chat"
    },
    {
      id: "2", 
      title: "LangGraph Node Detection Deb...",
      timestamp: "3 hours ago",
      type: "chat"
    },
    {
      id: "3",
      title: "Computer Science Resume Educ...",
      timestamp: "5 hours ago", 
      type: "chat"
    },
    {
      id: "4",
      title: "Adding +91 Country Code",
      timestamp: "1 day ago",
      type: "chat"
    },
    {
      id: "5",
      title: "GitHub Repo Deployment Troubl...",
      timestamp: "2 days ago",
      type: "chat"
    },
    {
      id: "6",
      title: "Phoenix IMF Gadget API Challen...",
      timestamp: "3 days ago",
      type: "chat"
    },
    {
      id: "7",
      title: "Markdown UI for Chatbot",
      timestamp: "4 days ago",
      type: "chat"
    },
    {
      id: "8",
      title: "PostgreSQL Docker Database S...",
      timestamp: "5 days ago",
      type: "chat"
    },
    {
      id: "9",
      title: "Drizzle ORM Setup for Node.js",
      timestamp: "1 week ago",
      type: "chat"
    },
    {
      id: "10",
      title: "Make the streamed chat ui bett...",
      timestamp: "1 week ago",
      type: "chat"
    },
    {
      id: "11",
      title: "Understanding AI Evals",
      timestamp: "2 weeks ago",
      type: "chat"
    },
    {
      id: "12",
      title: "Hackathon Team Evaluation Plat...",
      timestamp: "2 weeks ago",
      type: "chat"
    },
    {
      id: "13",
      title: "Implementing Chatbot-Style Str...",
      timestamp: "3 weeks ago",
      type: "chat"
    },
    {
      id: "14",
      title: "AI-Powered Library Managemen...",
      timestamp: "3 weeks ago",
      type: "chat"
    },
    {
      id: "15",
      title: "Improving MessageItem Compo...",
      timestamp: "1 month ago",
      type: "chat"
    },
    {
      id: "16",
      title: "Greeting and Assistance",
      timestamp: "1 month ago",
      type: "chat"
    },
    {
      id: "17",
      title: "Optimizing MessageItem Compo...",
      timestamp: "1 month ago",
      type: "chat"
    },
    {
      id: "18",
      title: "Erase: Vector Search Tool for Re...",
      timestamp: "1 month ago",
      type: "chat"
    },
    {
      id: "19",
      title: "Optimizing ChatService Code St...",
      timestamp: "2 months ago",
      type: "chat"
    },
    {
      id: "20",
      title: "Defining Custom Colors in Next.j...",
      timestamp: "2 months ago",
      type: "chat"
    }
  ],
  artifacts: []
};

export const menuItems = [
  {
    title: "New chat",
    icon: Plus,
    action: "new-chat"
  },
  {
    title: "Chats", 
    icon: MessageCircle,
    action: "chats"
  },
  {
    title: "Artifacts",
    icon: FileText,
    action: "artifacts"
  }
];
