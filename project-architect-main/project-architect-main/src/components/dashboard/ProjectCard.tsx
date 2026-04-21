import { MoreHorizontal, Calendar, ArrowUpRight, Trash2, Edit, Copy, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "in_progress" | "completed" | "archived" | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

interface ProjectCardProps {
  project: Project;
  delay?: number;
}

const statusConfig = {
  draft: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "Em Progresso", className: "bg-primary/20 text-primary" },
  completed: { label: "Concluído", className: "bg-success/20 text-success" },
  archived: { label: "Arquivado", className: "bg-muted text-muted-foreground" },
};

export function ProjectCard({ project, delay = 0 }: ProjectCardProps) {
  const navigate = useNavigate();
  const projectStatus = project.status ?? "draft";
  const status = statusConfig[projectStatus];
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();

  const formattedDate = project.updated_at
    ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true, locale: ptBR })
    : "Data desconhecida";

  const handleDelete = () => {
    deleteProject.mutate(project.id);
  };

  const handleArchive = () => {
    updateProject.mutate({
      id: project.id,
      status: "archived",
    });
  };

  const handleOpen = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div
      className="glass-card-hover rounded-xl p-5 opacity-0 animate-fade-up group cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={handleOpen}
    >
      <div className="flex items-start justify-between mb-4">
        <Badge variant="outline" className={cn("text-xs", status.className)}>
          {status.label}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleArchive(); }}>
              <Archive className="h-4 w-4 mr-2" />
              Arquivar
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-destructive"
                  onSelect={(e) => e.preventDefault()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O projeto "{project.name}" será permanentemente excluído.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {project.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {project.description || "Sem descrição"}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-primary hover:text-primary"
          onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        >
          Abrir
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}