import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile nav */}
      <BottomNav />

      <main className="min-h-screen pt-16 pb-24 px-4 md:px-6 lg:pt-8 lg:pb-8 lg:pl-72 lg:pr-8">
        <div className="w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
