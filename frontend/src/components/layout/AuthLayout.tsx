import { Outlet } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground dark">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      
      <div className="z-10 w-full max-w-md p-8 bg-card/50 backdrop-blur-xl border rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary/10 rounded-full mb-4 ring-1 ring-primary/20">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SentinelAI</h1>
          <p className="text-sm text-muted-foreground mt-1">Privileged Access Misuse Detection</p>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
