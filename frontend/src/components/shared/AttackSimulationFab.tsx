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
    
    // Stagger the events being added to the UI to simulate live attack
    sequence.forEach((event, idx) => {
      setTimeout(() => {
        setEvents(prev => [...prev, event]);
        if (idx === sequence.length - 1) {
          setTimeout(() => setIsRunning(false), 2000);
        }
      }, idx * 1500); // 1.5s delay between each event
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-[350px]"
          >
            <Card className="border-destructive/30 shadow-2xl shadow-destructive/20 backdrop-blur-md bg-background/90 overflow-hidden">
              <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between">
                <span className="font-bold flex items-center gap-2"><Crosshair className="w-4 h-4" /> Live Attack Simulator</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive-foreground hover:bg-black/20" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="text-sm text-muted-foreground">
                  Launch a simulated insider threat sequence. Watch the AI detect the anomalies in real-time.
                </div>
                
                <Button 
                  onClick={startSimulation} 
                  disabled={isRunning} 
                  className={`w-full ${isRunning ? 'bg-muted text-muted-foreground' : 'bg-destructive hover:bg-destructive/90 text-white'}`}
                >
                  {isRunning ? 'Simulation in Progress...' : 'Start Attack Sequence'}
                </Button>

                <div className="h-[200px] bg-black/90 rounded-md border p-3 overflow-y-auto space-y-2 font-mono text-xs">
                  {events.map((e, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-2 ${e.type === 'Alert' ? 'text-orange-400' : e.type === 'Block' ? 'text-red-500 font-bold' : 'text-green-400'}`}
                    >
                      <span className="opacity-50 shrink-0">[{new Date(e.time).toLocaleTimeString()}]</span>
                      <span>
                        {e.type === 'Block' && <ShieldAlert className="inline w-3 h-3 mr-1 mb-0.5" />}
                        {e.type === 'Alert' && <TerminalSquare className="inline w-3 h-3 mr-1 mb-0.5" />}
                        {e.description}
                        {e.riskDelta && <span className="ml-1 opacity-80">(+{e.riskDelta} Risk)</span>}
                      </span>
                    </motion.div>
                  ))}
                  {events.length === 0 && !isRunning && (
                    <div className="text-muted-foreground text-center pt-16 italic opacity-50">Awaiting sequence...</div>
                  )}
                  {isRunning && (
                    <div className="text-muted-foreground flex gap-1 items-center animate-pulse">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Listening for telemetry...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          size="lg" 
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full w-14 h-14 p-0 shadow-2xl ${isOpen ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-destructive text-white hover:bg-destructive/90'}`}
        >
          {isOpen ? <ChevronUp className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6 animate-pulse" />}
        </Button>
      </motion.div>
    </div>
  );
}
