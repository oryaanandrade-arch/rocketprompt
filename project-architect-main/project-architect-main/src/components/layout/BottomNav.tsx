import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navigationItems } from "./navigation";
import rocketLogo from "@/assets/rocketprompt-logo.png";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate("/landing");
  };

  return (
    <>
      {/* Top header (mobile) */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border lg:hidden">
        <div className="flex items-center gap-2">
          <img src={rocketLogo} alt="RocketPrompt" className="h-9 w-9 rounded-lg" />
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">RocketPrompt</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Bottom Navigation Bar (mobile) */}
      <nav className="fixed bottom-3 left-3 right-3 z-50 lg:hidden">
        <div className="flex items-center gap-1 px-2 py-2 rounded-2xl bg-background/90 backdrop-blur-xl border border-border shadow-2xl overflow-x-auto scrollbar-hide">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-[60px] h-14 px-2 rounded-xl transition-all duration-200 shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                <span className="text-[9px] mt-1 font-medium truncate max-w-[60px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] h-14 px-2 rounded-xl transition-all shrink-0 border-l border-border ml-1 pl-3",
                location.pathname === "/admin"
                  ? "bg-accent text-accent-foreground"
                  : "text-accent"
              )}
            >
              <Shield className="h-4.5 w-4.5" />
              <span className="text-[9px] mt-1 font-medium">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
