import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Crown,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Dashboard } from "@/pages/Dashboard";
import { GameAnalysis } from "@/pages/GameAnalysis";
import { OpeningExplorer } from "@/pages/OpeningExplorer";
import { Lessons } from "@/pages/Lessons";
import "./index.css";

type Page = "dashboard" | "analysis" | "openings" | "lessons";

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: "analysis",
    label: "Game Analysis",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "openings",
    label: "Opening Explorer",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: "lessons",
    label: "Lessons",
    icon: <GraduationCap className="w-5 h-5" />,
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "analysis":
        return <GameAnalysis />;
      case "openings":
        return <OpeningExplorer />;
      case "lessons":
        return <Lessons />;
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`flex flex-col border-r border-white/5 bg-card/30 backdrop-blur transition-all duration-300 ${sidebarCollapsed ? "w-[68px]" : "w-[240px]"
            }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 border-b border-white/5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-sm tracking-tight whitespace-nowrap">
                  Chess Coach
                </h1>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                  Improve your game
                </p>
              </div>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const btn = (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                    }`}
                >
                  <span className={isActive ? "text-amber-400" : ""}>{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }
              return btn;
            })}
          </nav>

          {/* Collapse toggle */}
          <div className="p-2 border-t border-white/5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-[1400px] mx-auto">{renderPage()}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
