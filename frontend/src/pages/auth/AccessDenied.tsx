import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
      <div className="p-4 bg-destructive/10 rounded-full">
        <ShieldAlert className="w-16 h-16 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-destructive">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Your login attempt has been blocked due to a high-risk security prediction. Please contact your system administrator.
        </p>
      </div>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/login">Return to Login</Link>
      </Button>
    </div>
  );
}
