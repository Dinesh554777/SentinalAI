import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";

export function AccessDenied() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center space-y-6 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-glow-pulse" />
        <div className="relative p-5 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-2xl ring-1 ring-destructive/20">
          <ShieldAlert className="w-14 h-14 text-destructive" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight text-destructive">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
          Your login attempt has been blocked due to a high-risk security prediction.
          Please contact your system administrator.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full"
      >
        <Lock className="w-3 h-3" />
        <span>Security Event ID: SEC-{Date.now().toString(36).toUpperCase()}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button asChild variant="outline" className="mt-2 h-10 border-muted-foreground/15">
          <Link to="/login">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Login
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
