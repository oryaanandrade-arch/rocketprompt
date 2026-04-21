import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const suggestions = [
  "SaaS de gestão de projetos",
  "App de delivery para restaurantes",
  "Plataforma de cursos online",
  "Sistema de agendamento",
];

export function AIAssistant() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    // Navigate to generator with pre-filled idea
    navigate(`/generator?idea=${encodeURIComponent(input)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="glass-card rounded-xl p-6 opacity-0 animate-fade-up relative overflow-hidden"
      style={{ animationDelay: "600ms" }}
    >
      {/* Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary animate-pulse-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Assistente IA</h3>
            <p className="text-xs text-muted-foreground">Pronto para criar</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Descreva sua ideia e eu vou gerar o prompt perfeito para o Lovable.
        </p>

        <div className="relative mb-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Quero criar um app de delivery para pet shops..."
            className="w-full h-24 resize-none rounded-lg border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
          <Button
            size="icon"
            className="absolute bottom-3 right-3 h-8 w-8"
            disabled={!input.trim()}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Sugestões rápidas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-full border border-border transition-all",
                  "hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
