import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn, ShieldAlert, FileSearch, TerminalSquare, AlertTriangle, Key, Clock } from "lucide-react";
import type { Activity } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  activities: Activity[];
}

export function LiveActivityFeed({ activities }: Props) {
  const getIcon = (action: string) => {
    if (action.includes('Login')) return { icon: LogIn, color: "text-blue-500", bg: "bg-blue-500/10" };
    if (action.includes('File')) return { icon: FileSearch, color: "text-purple-500", bg: "bg-purple-500/10" };
    if (action.includes('Command')) return { icon: TerminalSquare, color: "text-orange-500", bg: "bg-orange-500/10" };
    if (action.includes('Database')) return { icon: Key, color: "text-yellow-500", bg: "bg-yellow-500/10" };
    if (action.includes('Alert') || action.includes('Risk')) return { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" };
    return { icon: ShieldAlert, color: "text-muted-foreground", bg: "bg-muted" };
  };

  return (
    <Card className="h-full flex flex-col backdrop-blur-md bg-background/60">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Live Feed
            </CardTitle>
            <CardDescription className="text-xs">Real-time event stream</CardDescription>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-lg">
            {activities.length} events
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-[500px] overflow-y-auto p-3">
          <div className="relative">
            {/* Timeline connector */}
            {activities.length > 1 && (
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/20 via-muted to-transparent" />
            )}

            <AnimatePresence initial={false}>
              {activities.map((activity, idx) => {
                const { icon: Icon, color, bg } = getIcon(activity.action);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -15, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.02 }}
                    className="relative flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors group"
                  >
                    <div className={`relative z-10 p-2 ${bg} rounded-xl border border-white/5 shadow-sm shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold truncate">{activity.action}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(activity.time).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {activity.userId} • {activity.device}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          activity.riskScore >= 80 ? 'bg-destructive/10 text-destructive' :
                          activity.riskScore >= 40 ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {activity.riskScore}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          activity.status === 'Success' ? 'bg-green-500/10 text-green-500' :
                          activity.status === 'Failed' ? 'bg-red-500/10 text-red-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
