import { FileEdit, CheckCircle, Sparkles, FolderPlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecentActivity, ActivityItem } from "@/hooks/useRecentActivity";

const iconMap = {
  blueprint_generated: { icon: Sparkles, iconColor: "text-primary", bgColor: "bg-primary/10" },
  project_completed: { icon: CheckCircle, iconColor: "text-success", bgColor: "bg-success/10" },
  project_updated: { icon: FileEdit, iconColor: "text-warning", bgColor: "bg-warning/10" },
  project_created: { icon: FolderPlus, iconColor: "text-muted-foreground", bgColor: "bg-muted" },
};

export function RecentActivity() {
  const { data: activities, isLoading, error } = useRecentActivity();

  return (
    <div className="glass-card rounded-xl p-6 opacity-0 animate-fade-up" style={{ animationDelay: "500ms" }}>
      <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Erro ao carregar atividades
        </p>
      ) : !activities || activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma atividade recente
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = iconMap[activity.type];
            const Icon = config.icon;
            
            return (
              <div key={activity.id} className="flex items-start gap-4 group">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                    config.bgColor
                  )}
                >
                  <Icon className={cn("h-5 w-5", config.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
