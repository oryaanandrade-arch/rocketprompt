import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptTemplate } from "@/data/promptTemplates";

interface TemplateGalleryCardProps {
  template: PromptTemplate;
}

export function TemplateGalleryCard({ template }: TemplateGalleryCardProps) {
  const navigate = useNavigate();
  const Icon = template.icon;

  const handleUse = () => {
    navigate(`/generator?template=${template.id}`);
  };

  const handleDetails = () => {
    navigate(`/templates/${template.id}`);
  };

  return (
    <Card onClick={handleDetails} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl flex flex-col cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {template.imageUrl ? (
          <img
            src={template.imageUrl}
            alt={template.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Icon className="h-16 w-16 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="backdrop-blur-md bg-background/80 border border-border">
            <Icon className="h-3 w-3 mr-1" />
            {template.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">
          {template.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 flex-1">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={(e) => { e.stopPropagation(); handleDetails(); }}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Ver detalhes
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); handleUse(); }}
            size="sm"
            className="flex-1 group/btn"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Usar
            <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
