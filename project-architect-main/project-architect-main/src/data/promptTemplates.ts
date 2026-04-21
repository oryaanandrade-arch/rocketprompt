import { 
  Megaphone, 
  ShoppingCart, 
  PenTool, 
  Rocket, 
  Zap, 
  Brain, 
  Code, 
  Palette,
  Users,
  TrendingUp,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Target,
  BarChart3,
  UtensilsCrossed,
  PawPrint,
  Scissors,
  Stethoscope,
  GraduationCap,
  Dumbbell,
  Car,
  Building2,
  Music,
  Camera,
  Briefcase,
  Truck,
  Store,
  Smartphone,
  type LucideIcon
} from "lucide-react";

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  description: string;
  basePrompt: string;
  tags: string[];
  imageUrl?: string;
}

export const promptTemplates: PromptTemplate[] = [
  // Marketing
  {
    id: "marketing-landing",
    name: "Landing Page de Alta Conversão",
    category: "Marketing",
    icon: Megaphone,
    description: "Crie uma landing page otimizada para conversões com copy persuasiva",
    basePrompt: "Quero criar uma landing page de alta conversão para [PRODUTO/SERVIÇO]. A página deve ter: hero section impactante, benefícios claros, prova social, depoimentos, FAQ e CTA forte. Público-alvo: [PÚBLICO]. Objetivo principal: [OBJETIVO].",
    tags: ["landing", "conversão", "leads"],
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
  },
  {
    id: "marketing-email",
    name: "Sequência de Email Marketing",
    category: "Marketing",
    icon: Mail,
    description: "Desenvolva uma sequência de emails que converte",
    basePrompt: "Preciso de uma sequência de email marketing para [OBJETIVO]. A sequência deve ter: email de boas-vindas, nurturing, oferta e follow-up. Tom de voz: [TOM]. Produto: [PRODUTO].",
    tags: ["email", "automação", "nurturing"],
    imageUrl: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&q=80"
  },
  
  // Vendas
  {
    id: "sales-crm",
    name: "Sistema CRM Completo",
    category: "Vendas",
    icon: Users,
    description: "Um CRM moderno para gerenciar leads e clientes",
    basePrompt: "Quero construir um sistema CRM para [TIPO DE NEGÓCIO]. Funcionalidades: gestão de leads, pipeline de vendas, histórico de interações, dashboard de métricas, integração com email e calendário. Foco em: [PRIORIDADE].",
    tags: ["crm", "leads", "pipeline"],
    imageUrl: "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80"
  },
  {
    id: "sales-dashboard",
    name: "Dashboard de Vendas",
    category: "Vendas",
    icon: BarChart3,
    description: "Painel analítico para acompanhar métricas de vendas",
    basePrompt: "Preciso de um dashboard de vendas que mostre: receita total, taxa de conversão, ticket médio, vendas por período, comparativo mensal, top vendedores e produtos mais vendidos. Dados: [FONTE DE DADOS].",
    tags: ["dashboard", "analytics", "métricas"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
  },
  
  // Copywriting
  {
    id: "copy-vsl",
    name: "VSL (Video Sales Letter)",
    category: "Copywriting",
    icon: PenTool,
    description: "Script persuasivo para vídeo de vendas",
    basePrompt: "Crie um script de VSL para [PRODUTO]. Estrutura: gancho inicial, problema, agitação, solução, benefícios, prova social, oferta irresistível, garantia e CTA urgente. Duração: [TEMPO]. Tom: [TOM].",
    tags: ["vsl", "script", "persuasão"],
    imageUrl: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&q=80"
  },
  {
    id: "copy-headlines",
    name: "Headlines Magnéticas",
    category: "Copywriting",
    icon: Target,
    description: "Títulos que capturam atenção imediatamente",
    basePrompt: "Gere 20 headlines magnéticas para [PRODUTO/SERVIÇO]. Use técnicas: curiosidade, benefício direto, urgência, números específicos, perguntas provocativas. Público: [PÚBLICO]. Objetivo: [OBJETIVO].",
    tags: ["headlines", "títulos", "atenção"],
    imageUrl: "https://images.unsplash.com/photo-1504265110150-5d6b412499d6?w=800&q=80"
  },
  
  // SaaS
  {
    id: "saas-subscription",
    name: "SaaS com Assinaturas",
    category: "SaaS",
    icon: Rocket,
    description: "Plataforma SaaS completa com sistema de pagamentos",
    basePrompt: "Quero criar um SaaS de [NICHO] com: autenticação, planos de assinatura (mensal/anual/vitalício), dashboard do usuário, área admin, onboarding guiado e integração com Stripe. Stack: React + Supabase.",
    tags: ["saas", "subscription", "planos"],
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
  },
  {
    id: "saas-multitenancy",
    name: "SaaS Multi-tenant",
    category: "SaaS",
    icon: Users,
    description: "Plataforma com múltiplas organizações isoladas",
    basePrompt: "Desenvolva um SaaS multi-tenant para [PROPÓSITO]. Cada tenant deve ter: dados isolados, usuários próprios, configurações personalizadas, billing separado. Funcionalidades: [FEATURES].",
    tags: ["multi-tenant", "organizações", "isolamento"],
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&q=80"
  },
  
  // Automação
  {
    id: "automation-workflow",
    name: "Automação de Workflows",
    category: "Automação",
    icon: Zap,
    description: "Sistema de automação de processos empresariais",
    basePrompt: "Crie um sistema de automação de workflows para [PROCESSO]. Deve incluir: criação visual de fluxos, triggers automáticos, condicionais, integrações via webhook, logs de execução e notificações.",
    tags: ["workflow", "automação", "processos"],
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"
  },
  {
    id: "automation-scheduling",
    name: "Agendamento Inteligente",
    category: "Automação",
    icon: Calendar,
    description: "Sistema de agendamento com lembretes automáticos",
    basePrompt: "Desenvolva um sistema de agendamento para [TIPO DE SERVIÇO]. Features: calendário interativo, horários disponíveis em tempo real, confirmação por email/WhatsApp, lembretes automáticos, reagendamento fácil.",
    tags: ["agendamento", "calendário", "lembretes"],
    imageUrl: "https://images.unsplash.com/photo-1506784951206-8854ef24cbaf?w=800&q=80"
  },
  
  // IA
  {
    id: "ai-chatbot",
    name: "Chatbot com IA",
    category: "IA",
    icon: Brain,
    description: "Assistente virtual inteligente com GPT",
    basePrompt: "Construa um chatbot com IA para [FINALIDADE]. Deve ter: interface de chat moderna, histórico de conversas, streaming de respostas, contexto persistente, personalidade definida: [PERSONALIDADE].",
    tags: ["chatbot", "gpt", "assistente"],
    imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80"
  },
  {
    id: "ai-content",
    name: "Gerador de Conteúdo com IA",
    category: "IA",
    icon: FileText,
    description: "Ferramenta para gerar textos automaticamente",
    basePrompt: "Crie uma ferramenta de geração de conteúdo com IA para [TIPO DE CONTEÚDO]. Features: templates pré-definidos, customização de tom, histórico de gerações, edição inline, exportação em múltiplos formatos.",
    tags: ["conteúdo", "geração", "textos"],
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
  },
  
  // Código
  {
    id: "code-api",
    name: "API REST Completa",
    category: "Código",
    icon: Code,
    description: "Backend robusto com autenticação e CRUD",
    basePrompt: "Desenvolva uma API REST para [SISTEMA]. Endpoints: autenticação JWT, CRUD de [ENTIDADES], validação de dados, rate limiting, documentação Swagger, logs estruturados. Stack: [TECNOLOGIA].",
    tags: ["api", "rest", "backend"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"
  },
  {
    id: "code-components",
    name: "Biblioteca de Componentes",
    category: "Código",
    icon: Palette,
    description: "Design system com componentes reutilizáveis",
    basePrompt: "Crie uma biblioteca de componentes React para [PROJETO]. Componentes: botões, inputs, modais, cards, tabelas, formulários. Requisitos: TypeScript, Tailwind CSS, acessibilidade, dark mode, variantes customizáveis.",
    tags: ["componentes", "design-system", "react"],
    imageUrl: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&q=80"
  },
  
  // Design
  {
    id: "design-dashboard",
    name: "Dashboard Admin Premium",
    category: "Design",
    icon: Palette,
    description: "Interface administrativa moderna e funcional",
    basePrompt: "Desenhe um dashboard administrativo para [SISTEMA]. Incluir: sidebar colapsável, header com notificações, cards de métricas, gráficos interativos, tabelas com filtros, tema claro/escuro. Estilo: moderno e minimalista.",
    tags: ["dashboard", "admin", "interface"],
    imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80"
  },
  {
    id: "design-mobile",
    name: "App Mobile First",
    category: "Design",
    icon: Smartphone,
    description: "Interface otimizada para dispositivos móveis",
    basePrompt: "Crie uma interface mobile-first para [APP]. Priorizar: navegação bottom-tab, gestos touch, performance, offline-first, PWA. Funcionalidades principais: [FEATURES].",
    tags: ["mobile", "pwa", "responsive"],
    imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80"
  },

  // ===== MODELOS PRONTOS =====

  // Pizzaria
  {
    id: "ready-pizzaria",
    name: "Site para Pizzaria",
    category: "Modelos Prontos",
    icon: UtensilsCrossed,
    description: "Site completo para pizzaria com cardápio digital, pedidos online e delivery",
    basePrompt: `Crie um site completo e profissional para uma pizzaria chamada [NOME DA PIZZARIA]. O site deve ser moderno, responsivo e otimizado para conversão de pedidos.

## Estrutura do Site

### 1. Hero Section
- Imagem de fundo em tela cheia de uma pizza artesanal com queijo derretendo
- Headline: "As melhores pizzas artesanais da cidade"
- Subheadline com proposta de valor única
- Botão CTA "Fazer Pedido" e "Ver Cardápio"
- Badge de avaliação (4.9 ★ no Google)

### 2. Cardápio Digital Interativo
- Categorias: Tradicionais, Especiais, Premium, Doces, Bebidas
- Cada pizza com: foto, nome, ingredientes, preço, tamanhos (P/M/G/GG)
- Filtros: vegetariana, sem glúten, mais vendidas
- Sistema de busca por ingrediente
- Animação suave ao trocar categorias

### 3. Sistema de Pedidos Online
- Carrinho de compras flutuante
- Seleção de tamanho e borda recheada
- Opção de meia-a-meia
- Campo de observações
- Cálculo automático de frete por CEP
- Tempo estimado de entrega
- Pagamento: PIX, cartão, dinheiro (com troco)

### 4. Seção "Sobre Nós"
- História da pizzaria
- Fotos do forno a lenha e da equipe
- Diferenciais (massa artesanal, ingredientes selecionados)
- Certificações e prêmios

### 5. Avaliações e Depoimentos
- Carousel com avaliações do Google/iFood
- Nota média em destaque
- Fotos dos clientes com suas pizzas

### 6. Promoções e Combos
- Seção de ofertas do dia
- Combos família
- Programa de fidelidade (a cada 10 pizzas, 1 grátis)
- Countdown timer para promoções

### 7. Localização e Contato
- Mapa interativo com endereço
- Horário de funcionamento
- WhatsApp para pedidos
- Área de entrega destacada no mapa

### 8. Footer
- Links úteis, redes sociais, formas de pagamento

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS
- Design responsivo (mobile-first)
- Tema escuro com destaques em vermelho e amarelo (cores quentes de pizzaria)
- Animações suaves com Framer Motion
- SEO otimizado para "pizzaria + [cidade]"
- Performance: Lighthouse > 90
- PWA para acesso rápido no celular
- Integração com WhatsApp API para pedidos`,
    tags: ["pizzaria", "delivery", "cardápio", "restaurante"]
  },

  // Pet Shop
  {
    id: "ready-petshop",
    name: "Site para Pet Shop",
    category: "Modelos Prontos",
    icon: PawPrint,
    description: "Site completo para pet shop com agendamento de banho/tosa e loja online",
    basePrompt: `Crie um site completo e profissional para um pet shop chamado [NOME DO PET SHOP]. O site deve ser acolhedor, moderno e funcional.

## Estrutura do Site

### 1. Hero Section
- Imagem hero com pets felizes (cachorro e gato)
- Headline: "Cuidamos do seu melhor amigo com todo amor"
- CTA: "Agendar Banho & Tosa" e "Ver Produtos"
- Badges: "Veterinário 24h", "Entrega Grátis", "10+ anos de experiência"

### 2. Serviços
- Cards com ícones para cada serviço:
  - Banho & Tosa (com variações por porte)
  - Consulta Veterinária
  - Vacinação
  - Hotel Pet (hospedagem)
  - Adestramento
  - Spa Pet (hidratação, tosa artística)
- Preços e duração de cada serviço
- Botão de agendamento em cada card

### 3. Sistema de Agendamento Online
- Calendário interativo com horários disponíveis
- Seleção do pet (cadastro com nome, raça, porte, peso)
- Escolha do profissional (com foto e avaliação)
- Seleção de serviços extras (perfume, laço, escovação dental)
- Confirmação por WhatsApp/Email
- Lembretes automáticos 24h antes

### 4. Loja Online de Produtos
- Categorias: Rações, Petiscos, Brinquedos, Acessórios, Higiene, Medicamentos
- Filtros por: pet (cão/gato/outros), marca, preço, avaliação
- Página de produto com fotos, descrição, avaliações
- Carrinho de compras
- Frete calculado por CEP
- Pagamento online

### 5. Galeria de Transformações
- Antes e depois de banho & tosa
- Fotos organizadas por raça
- Vídeos curtos dos pets
- Feed estilo Instagram

### 6. Blog/Dicas
- Artigos sobre cuidados pet
- Categorias: Saúde, Alimentação, Comportamento, Raças
- Newsletter mensal

### 7. Depoimentos
- Avaliações dos tutores com fotos dos pets
- Nota média do Google
- Contador de pets atendidos

### 8. Contato e Localização
- Mapa com endereço
- Horário de funcionamento
- WhatsApp, telefone, email
- Área de atendimento para delivery

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS
- Design responsivo mobile-first
- Paleta de cores: tons de verde e branco (natureza/saúde)
- Ilustrações e ícones de pets
- SEO otimizado
- PWA
- Integração com WhatsApp para agendamento rápido`,
    tags: ["pet shop", "animais", "agendamento", "veterinário"]
  },

  // Agendador/Scheduling
  {
    id: "ready-agendador",
    name: "Sistema de Agendamento",
    category: "Modelos Prontos",
    icon: Calendar,
    description: "Plataforma completa de agendamento online para qualquer tipo de serviço",
    basePrompt: `Crie um sistema de agendamento online profissional e completo para [TIPO DE NEGÓCIO]. O sistema deve automatizar todo o processo de marcação de horários.

## Estrutura do Sistema

### 1. Landing Page do Negócio
- Hero com proposta de valor
- Serviços oferecidos com preços e duração
- CTA "Agendar Agora"
- Depoimentos de clientes
- FAQ sobre o processo de agendamento

### 2. Página de Agendamento
- Seleção do serviço (com descrição, duração e preço)
- Seleção do profissional (foto, especialidade, avaliação)
- Calendário visual com:
  - Dias disponíveis destacados
  - Horários livres em slots de 30/60 min
  - Fuso horário automático
  - Bloqueio de datas/horários indisponíveis
- Formulário de dados do cliente (nome, email, telefone)
- Campo de observações
- Resumo do agendamento antes de confirmar
- Confirmação com código único

### 3. Dashboard Administrativo
- Visão geral do dia/semana/mês
- Lista de agendamentos com status (confirmado, pendente, cancelado, concluído)
- Gestão de profissionais e horários
- Bloqueio de agenda (férias, feriados)
- Relatórios: agendamentos por período, taxa de cancelamento, receita estimada
- Notificações em tempo real

### 4. Painel do Cliente
- Meus agendamentos (próximos e histórico)
- Reagendar ou cancelar com antecedência mínima
- Avaliação pós-serviço (1-5 estrelas + comentário)
- Histórico de serviços realizados

### 5. Notificações Automáticas
- Confirmação por email após agendamento
- Lembrete 24h antes por email
- Lembrete 1h antes por push/WhatsApp
- Notificação de cancelamento
- Solicitação de avaliação após o serviço

### 6. Configurações
- Horário de funcionamento por dia da semana
- Tempo entre agendamentos (buffer)
- Antecedência mínima para agendar/cancelar
- Limite de agendamentos simultâneos
- Preços e duração por serviço

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS + Supabase
- Autenticação para admin e clientes
- RLS para isolamento de dados
- Design responsivo e acessível
- Tema profissional com cores neutras
- Animações suaves
- SEO otimizado`,
    tags: ["agendamento", "scheduling", "calendário", "serviços"]
  },

  // Chatbot
  {
    id: "ready-chatbot",
    name: "Chatbot Inteligente",
    category: "Modelos Prontos",
    icon: MessageSquare,
    description: "Chatbot com IA para atendimento automatizado, FAQ e suporte ao cliente",
    basePrompt: `Crie um chatbot inteligente e completo com IA para [TIPO DE NEGÓCIO/SERVIÇO]. O chatbot deve oferecer atendimento automatizado, resolver dúvidas e capturar leads.

## Estrutura do Chatbot

### 1. Interface de Chat
- Widget flutuante no canto inferior direito
- Botão com animação de pulse para chamar atenção
- Área de chat com:
  - Avatar do bot personalizado
  - Bolhas de mensagem estilizadas (bot vs usuário)
  - Indicador de "digitando..." com animação
  - Suporte a markdown nas respostas
  - Botões de ação rápida inline
  - Carousel de opções quando aplicável
  - Timestamps nas mensagens
- Input com placeholder contextual
- Botão de enviar e suporte a Enter
- Botão para limpar/iniciar nova conversa
- Opção de minimizar/maximizar

### 2. Inteligência do Bot
- Integração com API de IA (GPT/Gemini)
- Contexto persistente durante a conversa
- Personalidade definida: profissional, amigável e objetivo
- Base de conhecimento sobre o negócio
- Respostas para FAQ automáticas:
  - Horário de funcionamento
  - Preços e serviços
  - Formas de pagamento
  - Localização e contato
  - Políticas (troca, devolução, garantia)
- Fallback para atendente humano quando necessário

### 3. Captura de Leads
- Solicitar nome e email naturalmente na conversa
- Identificar intenção de compra
- Salvar dados do lead no banco de dados
- Classificar lead (quente, morno, frio)
- Notificar equipe de vendas

### 4. Dashboard Administrativo
- Histórico de todas as conversas
- Métricas: total de conversas, tempo médio, satisfação
- Leads capturados com detalhes
- Perguntas mais frequentes
- Exportar conversas
- Configurar respostas rápidas
- Treinar o bot com novas informações

### 5. Funcionalidades Avançadas
- Horário de atendimento (respostas diferentes fora do horário)
- Transferência para WhatsApp/email
- Multi-idioma (PT/EN/ES)
- Histórico de conversa por usuário
- Avaliação de satisfação ao final

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS
- Streaming de respostas da IA (token a token)
- Supabase para armazenar conversas e leads
- Design responsivo
- Widget leve e performático
- Acessibilidade (ARIA labels, navegação por teclado)
- Tema customizável (cores da marca)`,
    tags: ["chatbot", "atendimento", "IA", "suporte"]
  },

  // Barbearia
  {
    id: "ready-barbearia",
    name: "Site para Barbearia",
    category: "Modelos Prontos",
    icon: Scissors,
    description: "Site premium para barbearia com agendamento e portfólio de cortes",
    basePrompt: `Crie um site premium e masculino para uma barbearia chamada [NOME DA BARBEARIA]. Design sofisticado com tons escuros e detalhes dourados.

## Estrutura do Site

### 1. Hero Section
- Vídeo ou imagem hero em tela cheia (barbeiro trabalhando)
- Headline em fonte serif elegante: "A arte do corte perfeito"
- CTA: "Agendar Horário"
- Horário de funcionamento visível

### 2. Serviços e Preços
- Cards estilizados para cada serviço:
  - Corte Masculino (R$ XX) - 30min
  - Barba Completa (R$ XX) - 20min
  - Corte + Barba (R$ XX) - 45min
  - Degradê/Fade (R$ XX) - 40min
  - Pigmentação de Barba (R$ XX) - 30min
  - Relaxamento/Hidratação (R$ XX) - 25min
  - Combo VIP: Corte + Barba + Hidratação + Cerveja (R$ XX) - 60min
- Ícones premium para cada serviço

### 3. Agendamento Online
- Escolha do barbeiro (com foto, especialidade e avaliação)
- Calendário elegante
- Horários disponíveis
- Possibilidade de combo de serviços
- Confirmação por WhatsApp

### 4. Portfólio / Galeria
- Grid de fotos antes/depois
- Filtro por tipo de corte
- Galeria em lightbox
- Estilo Instagram com hover effects

### 5. Equipe
- Cards dos barbeiros com:
  - Foto profissional
  - Nome e especialidade
  - Anos de experiência
  - Avaliação média
  - Link para agendar direto

### 6. Experiência VIP
- Descrição do ambiente (cerveja artesanal, TV esportes, ambiente climatizado)
- Fotos do espaço
- Programa de fidelidade (10 cortes = 1 grátis)

### 7. Depoimentos
- Avaliações com fotos
- Vídeos de clientes satisfeitos
- Nota do Google em destaque

### 8. Localização e Contato
- Mapa estilizado
- Endereço, WhatsApp, Instagram
- Horário de funcionamento detalhado

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS
- Design dark theme premium (preto, dourado, branco)
- Fontes: serif para títulos, sans-serif para corpo
- Animações elegantes e suaves
- Mobile-first
- SEO otimizado para "barbearia + [cidade]"
- PWA`,
    tags: ["barbearia", "corte", "barba", "agendamento"]
  },

  // Clínica/Consultório
  {
    id: "ready-clinica",
    name: "Site para Clínica Médica",
    category: "Modelos Prontos",
    icon: Stethoscope,
    description: "Site profissional para clínica médica ou consultório com agendamento",
    basePrompt: `Crie um site profissional e confiável para uma clínica médica chamada [NOME DA CLÍNICA]. Design clean e inspirador de confiança.

## Estrutura do Site

### 1. Hero Section
- Design limpo e profissional
- Headline: "Cuidando da sua saúde com excelência"
- CTA: "Agendar Consulta" e "Nossos Especialistas"
- Badges: CRM ativo, anos de experiência, número de pacientes atendidos

### 2. Especialidades
- Grid de especialidades com ícones médicos:
  - Clínica Geral, Cardiologia, Dermatologia, Ortopedia, etc.
- Descrição breve de cada especialidade
- Botão para agendar por especialidade

### 3. Corpo Clínico
- Cards dos médicos com:
  - Foto profissional
  - Nome, CRM, especialidade
  - Formação acadêmica
  - Convênios aceitos
  - Horários de atendimento
  - Botão "Agendar com este médico"

### 4. Agendamento Online
- Seleção de especialidade
- Escolha do médico
- Tipo: consulta presencial ou telemedicina
- Calendário com disponibilidade
- Formulário com dados do paciente
- Upload de exames anteriores (opcional)
- Confirmação por email

### 5. Convênios
- Logos de todos os convênios aceitos
- Informação sobre atendimento particular
- Tabela de valores de consulta particular

### 6. Estrutura e Equipamentos
- Fotos do consultório/clínica
- Descrição dos equipamentos modernos
- Certificações e acreditações
- Acessibilidade

### 7. Blog Saúde
- Artigos sobre saúde e prevenção
- Categorias por especialidade
- Dicas de saúde

### 8. Depoimentos
- Avaliações de pacientes
- Nota do Google Saúde

### 9. Emergência e Contato
- Telefone de emergência em destaque
- WhatsApp, email
- Endereço com mapa
- Horários de funcionamento

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS
- Paleta: azul, branco e verde (confiança/saúde)
- Design acessível (contraste, fontes legíveis)
- LGPD compliance para dados de pacientes
- Mobile-first
- SEO otimizado para "clínica + especialidade + [cidade]"`,
    tags: ["clínica", "médico", "saúde", "consultório"]
  },

  // Curso Online / EAD
  {
    id: "ready-ead",
    name: "Plataforma de Cursos Online",
    category: "Modelos Prontos",
    icon: GraduationCap,
    description: "Plataforma EAD completa com área do aluno, aulas em vídeo e certificados",
    basePrompt: `Crie uma plataforma de cursos online (EAD) completa para [ÁREA DE ENSINO]. Design moderno e focado na experiência de aprendizado.

## Estrutura da Plataforma

### 1. Landing Page
- Hero com headline impactante sobre transformação
- Vídeo de apresentação do instrutor
- Números: alunos formados, horas de conteúdo, nota média
- Grade curricular visual (módulos e aulas)
- Depoimentos em vídeo de alunos
- Garantia de 7 dias
- Botão de compra com preço e parcelamento

### 2. Catálogo de Cursos
- Grid de cursos com: thumbnail, título, instrutor, duração, nível, preço
- Filtros: categoria, nível (iniciante/intermediário/avançado), preço, avaliação
- Busca por nome ou tema
- Badge "Mais vendido", "Novo", "Em promoção"

### 3. Página do Curso
- Vídeo de apresentação
- Descrição completa
- O que você vai aprender (checklist)
- Pré-requisitos
- Grade curricular expandível (módulos > aulas)
- Instrutor (bio, credenciais, outros cursos)
- Avaliações dos alunos
- FAQ do curso
- CTA de compra fixo

### 4. Área do Aluno (Dashboard)
- Meus cursos com progresso (barra de %)
- Continuar de onde parou
- Certificados disponíveis
- Próximas aulas recomendadas
- Anotações pessoais

### 5. Player de Aulas
- Player de vídeo com controles (velocidade 0.5x-2x, qualidade)
- Lista de aulas na lateral (sidebar colapsável)
- Checkbox para marcar aula como concluída
- Materiais complementares (PDF, links)
- Seção de anotações
- Área de dúvidas/comentários por aula

### 6. Sistema de Certificados
- Certificado gerado automaticamente ao completar 100%
- PDF personalizado com nome, curso, data, código de verificação
- Página de verificação pública do certificado

### 7. Admin/Instrutor
- Dashboard com métricas (alunos, receita, progresso médio)
- Gerenciar cursos, módulos e aulas
- Upload de vídeos e materiais
- Gerenciar alunos e acessos
- Cupons de desconto

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS + Supabase
- Autenticação e autorização
- Stripe/pagamentos para compra de cursos
- Upload e streaming de vídeo
- Design responsivo
- Performance otimizada
- SEO para cada curso`,
    tags: ["ead", "cursos", "educação", "plataforma"]
  },

  // Academia/Fitness
  {
    id: "ready-academia",
    name: "Site para Academia/Fitness",
    category: "Modelos Prontos",
    icon: Dumbbell,
    description: "Site energético para academia com planos, aulas e acompanhamento fitness",
    basePrompt: `Crie um site energético e motivacional para uma academia chamada [NOME DA ACADEMIA]. Design moderno com vibe fitness.

## Estrutura do Site

### 1. Hero Section
- Vídeo de fundo com treinos intensos ou imagem impactante
- Headline motivacional: "Transforme seu corpo. Transforme sua vida."
- CTA: "Começar Agora" e "Aula Experimental Grátis"
- Contador: membros ativos, anos de mercado, aulas semanais

### 2. Planos e Preços
- Cards de planos:
  - Básico: musculação (R$ XX/mês)
  - Completo: musculação + aulas coletivas (R$ XX/mês)
  - Premium: tudo + personal + nutricionista (R$ XX/mês)
  - Anual com desconto
- Toggle mensal/anual
- Benefícios de cada plano
- CTA em cada card

### 3. Modalidades/Aulas
- Grid visual com foto de cada modalidade:
  - Musculação, CrossFit, Yoga, Pilates, Spinning, Boxe, Funcional, Dança, Natação
- Horários e instrutores de cada aula
- Nível de dificuldade
- Vagas disponíveis

### 4. Grade de Horários
- Tabela interativa por dia da semana
- Filtro por modalidade
- Horário de funcionamento geral

### 5. Estrutura
- Fotos profissionais do espaço
- Equipamentos disponíveis
- Áreas: musculação, cardio, funcional, piscina, vestiários
- Tour virtual (carousel de fotos)

### 6. Equipe
- Personal trainers com foto, especialidade e certificações
- Nutricionista
- Fisioterapeuta

### 7. Resultados / Transformações
- Antes e depois de alunos (com permissão)
- Depoimentos em vídeo
- Métricas de resultados

### 8. Blog Fitness
- Dicas de treino e nutrição
- Receitas fitness
- Artigos motivacionais

### 9. Contato
- Formulário para aula experimental
- WhatsApp, telefone
- Mapa com endereço
- Redes sociais

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS
- Paleta energética: preto, vermelho/laranja, branco
- Fontes bold e impactantes
- Animações dinâmicas
- Mobile-first
- SEO otimizado
- PWA`,
    tags: ["academia", "fitness", "treino", "saúde"]
  },

  // E-commerce
  {
    id: "ready-ecommerce",
    name: "Loja Virtual Completa",
    category: "Modelos Prontos",
    icon: Store,
    description: "E-commerce completo com carrinho, checkout e gestão de produtos",
    basePrompt: `Crie um e-commerce completo e profissional para vender [TIPO DE PRODUTOS]. Design focado em conversão de vendas.

## Estrutura do E-commerce

### 1. Home
- Banner rotativo com promoções e lançamentos
- Categorias principais em destaque
- Produtos em promoção (countdown timer)
- Mais vendidos
- Recém chegados
- Banner secundário de campanha
- Newsletter

### 2. Catálogo de Produtos
- Grid de produtos com: foto, nome, preço, desconto, avaliação, badge
- Filtros laterais: categoria, preço (range), cor, tamanho, marca, avaliação
- Ordenação: relevância, menor preço, maior preço, mais vendidos, mais recentes
- Busca inteligente com sugestões
- Visualização grid/lista
- Paginação ou scroll infinito

### 3. Página do Produto
- Galeria de fotos com zoom (múltiplas imagens)
- Nome, preço (de/por), avaliação, código SKU
- Seleção de variações: cor, tamanho
- Quantidade (+ / -)
- Botão "Comprar" e "Adicionar ao Carrinho"
- Frete: cálculo por CEP com prazo
- Descrição completa (tabs: detalhes, especificações, avaliações)
- Produtos relacionados
- Pergunte sobre este produto

### 4. Carrinho de Compras
- Lista de itens com foto, nome, variação, quantidade, preço
- Alterar quantidade ou remover
- Cupom de desconto
- Cálculo de frete
- Subtotal, desconto, frete, total
- Botões: continuar comprando, finalizar compra

### 5. Checkout
- Etapas: Identificação > Endereço > Pagamento > Confirmação
- Login ou compra como visitante
- Endereço com autocomplete por CEP
- Pagamento: cartão, PIX (com QR code), boleto
- Resumo do pedido
- Termos e condições
- Pedido confirmado com número e resumo

### 6. Área do Cliente
- Meus pedidos (status: processando, enviado, entregue)
- Rastreamento de envio
- Endereços salvos
- Dados pessoais
- Lista de desejos

### 7. Admin
- Dashboard: vendas, receita, pedidos, ticket médio
- Gestão de produtos (CRUD com variações e fotos)
- Gestão de pedidos e status
- Gestão de estoque
- Cupons de desconto
- Relatórios

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS + Supabase
- Autenticação
- Storage para fotos de produtos
- Pagamentos integrados
- SEO otimizado por produto
- Performance: lazy loading, otimização de imagens
- Mobile-first
- Acessibilidade`,
    tags: ["e-commerce", "loja", "vendas", "produtos"]
  },

  // Portfólio/Freelancer
  {
    id: "ready-portfolio",
    name: "Portfólio Profissional",
    category: "Modelos Prontos",
    icon: Briefcase,
    description: "Site portfólio impressionante para freelancers e profissionais criativos",
    basePrompt: `Crie um site portfólio premium e impactante para um profissional de [ÁREA]. Design criativo e minimalista que destaque os trabalhos.

## Estrutura do Site

### 1. Hero Section
- Animação de entrada impressionante
- Nome + título profissional (tipografia grande e elegante)
- Frase de posicionamento
- CTA: "Ver Projetos" e "Entrar em Contato"
- Indicador de scroll

### 2. Sobre Mim
- Foto profissional
- Bio envolvente (storytelling)
- Especialidades e skills (barras de progresso ou tags)
- Experiência em números (projetos, clientes, anos)
- Download do CV (PDF)

### 3. Portfólio de Projetos
- Grid masonry com thumbnails dos projetos
- Filtro por categoria
- Hover effect com título e tecnologias
- Página individual de cada projeto:
  - Galeria de screenshots/mockups
  - Descrição do desafio
  - Solução implementada
  - Tecnologias utilizadas
  - Resultados obtidos
  - Link para o projeto live
  - Depoimento do cliente

### 4. Serviços
- Cards dos serviços oferecidos
- Preços ou "A partir de R$ X"
- O que está incluído em cada pacote
- CTA para solicitar orçamento

### 5. Processo de Trabalho
- Timeline ou steps visuais:
  1. Briefing
  2. Pesquisa
  3. Prototipação
  4. Desenvolvimento
  5. Testes
  6. Entrega
- Ícones e descrições para cada etapa

### 6. Depoimentos
- Carousel com foto, nome, empresa e depoimento
- Logos de empresas/clientes

### 7. Blog / Artigos
- Posts sobre a área de atuação
- Tutoriais e dicas

### 8. Contato
- Formulário elegante (nome, email, tipo de projeto, orçamento, mensagem)
- Links para redes sociais e GitHub
- Email e WhatsApp
- Disponibilidade atual (disponível/indisponível)

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS
- Animações sofisticadas com Framer Motion
- Tema dark premium
- Tipografia marcante
- Mobile-first
- Performance excepcional
- SEO otimizado
- Lazy loading nas imagens`,
    tags: ["portfólio", "freelancer", "criativo", "profissional"]
  },

  // Imobiliária
  {
    id: "ready-imobiliaria",
    name: "Site para Imobiliária",
    category: "Modelos Prontos",
    icon: Building2,
    description: "Site imobiliário com busca avançada de imóveis, galeria e contato direto",
    basePrompt: `Crie um site profissional e sofisticado para uma imobiliária chamada [NOME DA IMOBILIÁRIA]. Focado em venda e aluguel de imóveis.

## Estrutura do Site

### 1. Hero Section
- Imagem hero de imóvel luxuoso
- Headline: "Encontre o imóvel dos seus sonhos"
- Barra de busca rápida: tipo (venda/aluguel), cidade, bairro, faixa de preço, quartos
- Números: imóveis disponíveis, clientes atendidos, anos de mercado

### 2. Busca Avançada de Imóveis
- Filtros completos:
  - Tipo: casa, apartamento, terreno, comercial, rural
  - Transação: venda, aluguel
  - Localização: estado, cidade, bairro
  - Preço: faixa com slider
  - Área: m² mínimo e máximo
  - Quartos, banheiros, vagas de garagem
  - Amenidades: piscina, churrasqueira, academia, portaria 24h
- Mapa com pins dos imóveis
- Resultados em grid com foto, preço, endereço, detalhes
- Ordenação por preço, área, relevância

### 3. Página do Imóvel
- Galeria de fotos em carousel (tela cheia)
- Tour virtual 360° (quando disponível)
- Informações: preço, área, quartos, banheiros, vagas
- Descrição detalhada
- Amenidades com ícones
- Localização no mapa com pontos de interesse próximos
- Formulário de contato/interesse
- Botão WhatsApp do corretor
- Imóveis similares

### 4. Destaques
- Imóveis em destaque/premium
- Lançamentos
- Oportunidades (preço abaixo do mercado)

### 5. Sobre a Imobiliária
- História e valores
- Equipe de corretores (foto, CRECI, especialidade)
- Números e conquistas
- Parcerias

### 6. Blog Imobiliário
- Dicas para compradores/inquilinos
- Tendências do mercado
- Financiamento e documentação

### 7. Contato
- Formulário completo
- Escritórios (mapa com endereço)
- Telefones e WhatsApp
- Redes sociais

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS + Supabase
- Design sofisticado e premium
- Paleta: tons de azul escuro, branco e dourado
- Busca avançada com filtros dinâmicos
- Galeria de fotos otimizada
- SEO por imóvel e localização
- Mobile-first
- Performance com lazy loading`,
    tags: ["imobiliária", "imóveis", "venda", "aluguel"]
  },

  // Delivery de Comida
  {
    id: "ready-delivery",
    name: "App de Delivery",
    category: "Modelos Prontos",
    icon: Truck,
    description: "Plataforma completa de delivery com cardápio, carrinho e rastreamento",
    basePrompt: `Crie uma plataforma de delivery de comida completa para [TIPO DE RESTAURANTE]. Interface mobile-first otimizada para pedidos rápidos.

## Estrutura do App

### 1. Home
- Barra de busca no topo
- Banner de promoções (carousel)
- Categorias rápidas (ícones): Promoções, Combos, Mais Pedidos, Novidades
- Restaurantes/itens em destaque
- Últimos pedidos (para clientes recorrentes)

### 2. Cardápio Digital
- Menu organizado por categorias com foto e âncora
- Cada item com:
  - Foto apetitosa
  - Nome e descrição
  - Preço
  - Badge de popular/novo
  - Tempo de preparo
- Modal de personalização:
  - Tamanho/porção
  - Adicionais com preço
  - Remover ingredientes
  - Observações especiais
  - Quantidade

### 3. Carrinho de Compras
- Lista de itens com edição rápida
- Subtotal por item
- Cupom de desconto
- Taxa de entrega (calculada por distância)
- Total
- Estimativa de entrega
- Botão "Finalizar Pedido"

### 4. Checkout
- Endereço de entrega (salvar favoritos)
- Forma de pagamento: PIX, cartão, dinheiro (com troco)
- Agendamento de entrega (agora ou programar)
- Resumo do pedido
- Confirmar pedido

### 5. Acompanhamento do Pedido
- Status em tempo real:
  - Pedido recebido ✓
  - Em preparação ⏳
  - Saiu para entrega 🏍️
  - Entregue ✅
- Dados do entregador (quando disponível)
- Chat com suporte
- Tempo estimado restante

### 6. Área do Cliente
- Meus pedidos (histórico)
- Repetir pedido anterior
- Endereços salvos
- Formas de pagamento
- Cupons disponíveis
- Avaliar pedidos anteriores

### 7. Admin/Restaurante
- Dashboard: pedidos do dia, receita, ticket médio
- Gestão de cardápio (CRUD)
- Fila de pedidos em tempo real
- Controle de estoque
- Relatórios de vendas
- Gestão de promoções e cupons

## Requisitos Técnicos
- React + TypeScript + Tailwind CSS + Supabase
- Design mobile-first
- Realtime para acompanhamento de pedidos
- Performance otimizada
- PWA para instalação
- Notificações push
- SEO otimizado`,
    tags: ["delivery", "comida", "restaurante", "pedidos"]
  },
];

// Importa imagens dos modelos prontos
import imgPizzaria from "@/assets/templates/pizzaria.jpg";
import imgPetshop from "@/assets/templates/petshop.jpg";
import imgAgendador from "@/assets/templates/agendador.jpg";
import imgChatbot from "@/assets/templates/chatbot.jpg";
import imgBarbearia from "@/assets/templates/barbearia.jpg";
import imgClinica from "@/assets/templates/clinica.jpg";
import imgEad from "@/assets/templates/ead.jpg";
import imgAcademia from "@/assets/templates/academia.jpg";
import imgEcommerce from "@/assets/templates/ecommerce.jpg";
import imgPortfolio from "@/assets/templates/portfolio.jpg";
import imgImobiliaria from "@/assets/templates/imobiliaria.jpg";
import imgDelivery from "@/assets/templates/delivery.jpg";

const readyImages: Record<string, string> = {
  "ready-pizzaria": imgPizzaria,
  "ready-petshop": imgPetshop,
  "ready-agendador": imgAgendador,
  "ready-chatbot": imgChatbot,
  "ready-barbearia": imgBarbearia,
  "ready-clinica": imgClinica,
  "ready-ead": imgEad,
  "ready-academia": imgAcademia,
  "ready-ecommerce": imgEcommerce,
  "ready-portfolio": imgPortfolio,
  "ready-imobiliaria": imgImobiliaria,
  "ready-delivery": imgDelivery,
};

promptTemplates.forEach((t) => {
  if (readyImages[t.id]) t.imageUrl = readyImages[t.id];
});

export const templateCategories = [
  { name: "Marketing", icon: Megaphone, color: "from-primary/80 to-primary" },
  { name: "Vendas", icon: TrendingUp, color: "from-primary/60 to-primary/90" },
  { name: "Copywriting", icon: PenTool, color: "from-primary/70 to-primary" },
  { name: "SaaS", icon: Rocket, color: "from-primary/50 to-primary/80" },
  { name: "Automação", icon: Zap, color: "from-primary/60 to-primary" },
  { name: "IA", icon: Brain, color: "from-primary/70 to-primary/90" },
  { name: "Código", icon: Code, color: "from-primary/50 to-primary/70" },
  { name: "Design", icon: Palette, color: "from-primary/60 to-primary/80" },
  { name: "Modelos Prontos", icon: Store, color: "from-primary to-foreground" },
];

