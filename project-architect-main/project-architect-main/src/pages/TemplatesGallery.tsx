import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TemplateGalleryCard } from "@/components/templates/TemplateGalleryCard";
import { promptTemplates, templateCategories } from "@/data/promptTemplates";
import { Search, LayoutTemplate, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const TemplatesGallery = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const filtered = useMemo(() => {
    return promptTemplates.filter((t) => {
      const matchesCategory =
        activeCategory === "Todos" || t.category === activeCategory;
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const featured = useMemo(
    () => promptTemplates.filter((t) => t.category === "Modelos Prontos").slice(0, 3),
    []
  );

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <LayoutTemplate className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Galeria de Templates
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Modelos prontos para qualquer nicho
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Escolha um modelo profissional, personalize em segundos e gere o melhor
            prompt do mercado para o seu projeto.
          </p>
        </div>

        {/* Featured */}
        {featured.length > 0 && activeCategory === "Todos" && !search && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((t) => (
              <TemplateGalleryCard key={t.id} template={t} />
            ))}
          </div>
        )}

        {/* Search & filters */}
        <div className="flex flex-col gap-4 sticky top-16 lg:top-0 z-10 bg-background/80 backdrop-blur-md py-3 -mx-4 px-4 md:-mx-6 md:px-6 border-y border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nicho, palavra-chave ou tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card"
            />
          </div>

          <div className="flex flex-wrap gap-2 pb-2">
            <Button
              variant={activeCategory === "Todos" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("Todos")}
              className="shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Todos
            </Button>
            {templateCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;
              return (
                <Button
                  key={cat.name}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.name)}
                  className={cn("shrink-0", isActive && "shadow-md")}
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {cat.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <LayoutTemplate className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum modelo encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filtered.map((t) => (
              <TemplateGalleryCard key={t.id} template={t} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TemplatesGallery;
