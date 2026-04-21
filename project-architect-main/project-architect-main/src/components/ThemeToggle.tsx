import { Moon, Sun } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  (props, ref) => {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("theme");
        if (stored === "light" || stored === "dark") return stored;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return "dark";
    });

    useEffect(() => {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
      setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 rounded-full transition-colors hover:bg-muted"
        aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
        {...props}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-primary transition-transform duration-300" />
        ) : (
          <Moon className="h-5 w-5 text-primary transition-transform duration-300" />
        )}
      </Button>
    );
  }
);

ThemeToggle.displayName = "ThemeToggle";