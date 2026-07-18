import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { AttackSimulationFab } from "../shared/AttackSimulationFab";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background dark text-foreground">
      <Sidebar />
      <div className="flex flex-col w-full flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative">
          {/* Subtle dot pattern background */}
          <div className="fixed inset-0 pointer-events-none dot-pattern opacity-20 z-0" />

          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
          <AttackSimulationFab />
        </main>
      </div>
    </div>
  );
}
