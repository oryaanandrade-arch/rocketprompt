import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useIsAdmin } from "@/hooks/useUserRole";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navigationItems, groupLabels, type NavItem } from "./navigation";
import rocketLogo from "@/assets/rocketprompt-logo.png";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate("/landing");
  };

  const groups = (["main", "create", "business", "account"] as NavItem["group"][]).map((g) => ({
    key: g,
    label: groupLabels[g],
    items: navigationItems.filter((i) => i.group === g),
  }));

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border shrink-0">
        <img src={rocketLogo} alt="RocketPrompt" className="h-10 w-10 rounded-xl shrink-0" />
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-foreground leading-tight">RocketPrompt</h1>
            <p className="text-xs text-muted-foreground">Estratégia em foguete</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.key} className="mb-3">
            {!collapsed && (
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : item.highlight
                          ? "text-primary hover:bg-primary/10"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {item.highlight && !isActive && !collapsed && (
                      <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                        IA
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all mt-auto border-t border-border pt-3",
              location.pathname === "/admin"
                ? "bg-accent text-accent-foreground"
                : "text-accent hover:bg-accent/10"
            )}
          >
            <Shield className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card shadow-md hover:bg-accent z-50"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          {!collapsed && profile?.full_name && (
            <div className="px-2 min-w-0">
              <p className="text-sm font-medium truncate">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">Conta Pro</p>
            </div>
          )}
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
