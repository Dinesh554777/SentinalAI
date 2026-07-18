import { Outlet } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground dark overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-blue-500/5 animate-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full max-w-md mx-4"
      >
        <div className="glass-strong rounded-3xl shadow-2xl shadow-black/20 p-8 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-primary animate-gradient" />

          {/* Subtle scan line effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              style={{ animation: 'scan-line 4s linear infinite' }} />
          </div>

          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="relative mb-5"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-glow-pulse" />
              <div className="relative p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl ring-1 ring-primary/20">
                <ShieldAlert className="w-10 h-10 text-primary" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-3xl font-bold tracking-tight"
            >
              <span className="text-gradient">SentinelAI</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-sm text-muted-foreground mt-2"
            >
              AI-Powered Privileged Access Misuse Detection
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
