import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crosshair, ShieldAlert, X, ChevronUp, TerminalSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { simulationService } from "@/mock/services";
import type { SimulationEvent } from "@/types";

export function AttackSimulationFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<SimulationEvent[]>([]);

  const startSimulation = async () => {
    setIsRunning(true);
    setEvents([]);
    const sequence = await simulationService.getSimulationSequence();

    sequence.forEach((event, idx) => {
      setTimeout(() => {
        setEvents(prev => [...prev, event]);
        if (idx === sequence.length - 1) {
          setTimeout(() => setIsRunning(false), 2000);
        }
      }, idx * 1500);
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Block': return 'text-red-400';
      case 'Alert': return 'text-orange-400';
      case 'Login': return 'text-blue-400';
      case 'Action': return 'text-green-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[380px]"
          >
            <Card className="border-destructive/30 shadow-2xl shadow-destructive/10 backdrop-blur-xl bg-background/90 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground px-4 py-2.5 flex items-center justify-between">
                <span className="font-bold flex items-center gap-2 text-sm">
                  <Crosshair className="w-4 h-4" />
                  Live Attack Simulator
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive-foreground hover:bg-black/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Launch a simulated insider threat sequence. Watch the AI detect anomalies in real-time.
                </p>

                <Button
                  onClick={startSimulation}
                  disabled={isRunning}
                  className={`w-full h-10 text-sm font-semibold transition-all duration-300 ${
                    isRunning
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 hover:to-red-600/90 text-white shadow-lg shadow-destructive/25'
                  }`}
                >
                  {isRunning ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Simulation in Progress...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Crosshair className="w-4 h-4" />
                      Start Attack Sequence
                    </div>
                  )}
                </Button>

                {/* Terminal */}
                <div className="relative">
                  {/* Terminal header */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/95 rounded-t-lg border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="text-[9px] text-white/30 ml-2 font-mono">sentinel-sim</span>
                  </div>

                  <div className="h-[220px] bg-black/90 rounded-b-lg border border-t-0 border-white/5 p-3 overflow-y-auto space-y-1.5 font-mono text-xs">
                    {events.map((e, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-2 ${getEventColor(e.type)}`}
                      >
                        <span className="opacity-40 shrink-0">[{new Date(e.time).toLocaleTimeString()}]</span>
                        <span>
                          {e.type === 'Block' && <ShieldAlert className="inline w-3 h-3 mr-1 mb-0.5" />}
                          {e.type === 'Alert' && <TerminalSquare className="inline w-3 h-3 mr-1 mb-0.5" />}
                          {e.description}
                          {e.riskDelta && <span className="ml-1 opacity-60">(+{e.riskDelta} Risk)</span>}
                        </span>
                      </motion.div>
                    ))}
                    {events.length === 0 && !isRunning && (
                      <div className="text-white/20 text-center pt-16 italic">Awaiting sequence...</div>
                    )}
                    {isRunning && (
                      <div className="text-green-400/70 flex gap-1 items-center animate-pulse text-[11px]">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Listening for telemetry...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full w-14 h-14 p-0 shadow-2xl transition-all duration-300 ${
            isOpen
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              : 'bg-gradient-to-br from-destructive to-red-600 text-white hover:from-destructive/90 hover:to-red-600/90 shadow-destructive/30'
          }`}
        >
          {isOpen ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-destructive rounded-full blur-md animate-glow-pulse" />
              <ShieldAlert className="w-6 h-6 relative" />
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
