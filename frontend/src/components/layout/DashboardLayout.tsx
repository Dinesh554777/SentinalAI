import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background dark text-foreground">
      <Sidebar />
      <div className="flex flex-col w-full flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
