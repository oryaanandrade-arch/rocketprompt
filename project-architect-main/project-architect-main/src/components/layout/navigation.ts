import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Rocket,
  Library,
  Settings,
  MessageSquare,
  FileSignature,
  LayoutTemplate,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  highlight?: boolean;
  group: "main" | "create" | "business" | "account";
}

export const navigationItems: NavItem[] = [
  // Main
  { icon: LayoutDashboard, label: "Visão Geral", path: "/", group: "main" },
  { icon: BarChart3, label: "Desempenho", path: "/performance", group: "main" },

  // Create
  { icon: MessageSquare, label: "Gerar Prompt", path: "/generator", highlight: true, group: "create" },
  { icon: LayoutTemplate, label: "Templates", path: "/templates", group: "create" },
  { icon: FolderKanban, label: "Projetos", path: "/projects", group: "create" },

  // Business
  { icon: Sparkles, label: "Arquitetura", path: "/architecture", group: "business" },
  { icon: Rocket, label: "Execução", path: "/execution", group: "business" },
  { icon: FileSignature, label: "Contratos", path: "/contracts", group: "business" },

  // Account
  { icon: Library, label: "Biblioteca", path: "/library", group: "account" },
  { icon: Settings, label: "Configurações", path: "/settings", group: "account" },
];

export const groupLabels: Record<NavItem["group"], string> = {
  main: "Principal",
  create: "Criar",
  business: "Negócios",
  account: "Conta",
};
