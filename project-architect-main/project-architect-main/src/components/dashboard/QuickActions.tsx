import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare, FileText, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { TemplatesModal } from "@/components/projects/TemplatesModal";
import { ImportIdeaModal } from "@/components/projects/ImportIdeaModal";
import { useHasActiveSubscription } from "@/hooks/useSubscription";

export function QuickActions() {
  const navigate = useNavigate();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

  const handleProtectedAction = (action: () => void) => {
    if (isLoading) return;
    
    if (!hasActiveSubscription) {
      navigate("/plans");
    } else {
      action();
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Gerar com IA - Principal */}
      <Button
        variant="default"
        className="h-auto flex-col gap-2 p-4 opacity-0 animate-fade-up glow-effect"
        style={{ animationDelay: "400ms" }}
        onClick={() => handleProtectedAction(() => navigate("/generator"))}
      >
        <MessageSquare className="h-5 w-5" />
        <div className="text-center">
          <p className="font-semibold">Gerar Prompt</p>
          <p className="text-xs opacity-70 font-normal">Chat com IA</p>
        </div>
      </Button>

      {/* Novo Projeto */}
      {hasActiveSubscription ? (
        <CreateProjectModal
          trigger={
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4 opacity-0 animate-fade-up"
              style={{ animationDelay: "500ms" }}
            >
              <Plus className="h-5 w-5" />
              <div className="text-center">
                <p className="font-semibold">Novo Projeto</p>
                <p className="text-xs opacity-70 font-normal">Criar do zero</p>
              </div>
            </Button>
          }
        />
      ) : (
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 p-4 opacity-0 animate-fade-up"
          style={{ animationDelay: "500ms" }}
          onClick={() => navigate("/plans")}
        >
          <Plus className="h-5 w-5" />
          <div className="text-center">
            <p className="font-semibold">Novo Projeto</p>
            <p className="text-xs opacity-70 font-normal">Criar do zero</p>
          </div>
        </Button>
      )}

      {/* Templates */}
      {hasActiveSubscription ? (
        <TemplatesModal
          trigger={
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4 opacity-0 animate-fade-up"
              style={{ animationDelay: "600ms" }}
            >
              <FileText className="h-5 w-5" />
              <div className="text-center">
                <p className="font-semibold">Templates</p>
                <p className="text-xs opacity-70 font-normal">Usar modelo pronto</p>
              </div>
            </Button>
          }
        />
      ) : (
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 p-4 opacity-0 animate-fade-up"
          style={{ animationDelay: "600ms" }}
          onClick={() => navigate("/plans")}
        >
          <FileText className="h-5 w-5" />
          <div className="text-center">
            <p className="font-semibold">Templates</p>
            <p className="text-xs opacity-70 font-normal">Usar modelo pronto</p>
          </div>
        </Button>
      )}

      {/* Importar Ideia */}
      {hasActiveSubscription ? (
        <ImportIdeaModal
          trigger={
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4 opacity-0 animate-fade-up"
              style={{ animationDelay: "700ms" }}
            >
              <Wand2 className="h-5 w-5" />
              <div className="text-center">
                <p className="font-semibold">Importar Ideia</p>
                <p className="text-xs opacity-70 font-normal">De texto ou URL</p>
              </div>
            </Button>
          }
        />
      ) : (
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 p-4 opacity-0 animate-fade-up"
          style={{ animationDelay: "700ms" }}
          onClick={() => navigate("/plans")}
        >
          <Wand2 className="h-5 w-5" />
          <div className="text-center">
            <p className="font-semibold">Importar Ideia</p>
            <p className="text-xs opacity-70 font-normal">De texto ou URL</p>
          </div>
        </Button>
      )}
    </div>
  );
}
