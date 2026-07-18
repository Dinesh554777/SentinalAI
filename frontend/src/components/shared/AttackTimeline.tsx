import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn, ShieldAlert, FileSearch, TerminalSquare, AlertTriangle, Key, ShieldCheck, Clock, MapPin, Monitor } from "lucide-react";
import type { Activity } from "@/types";
import { motion } from "framer-motion";

interface Props {
  activities: Activity[];
}

export function AttackTimeline({ activities }: Props) {
  const sortedActivities = [...activities].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const getEventStyle = (action: string, status: string) => {
    if (status === 'Denied') return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: ShieldAlert };
    if (action.includes('Alert') || action.includes('Risk')) return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle };
    if (action.includes('File')) return { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: FileSearch };
    if (action.includes('Command')) return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: TerminalSquare };
    if (action.includes('Database')) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Key };
    if (action.includes('Login')) return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: LogIn };
    return { color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', icon: ShieldCheck };
  };

  return (
    <Card className="h-full backdrop-blur-md bg-background/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Behavior Timeline
        </CardTitle>
        <CardDescription>Chronological sequence of identity actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative ml-4">
          {/* Gradient connector line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-muted to-transparent" />

          <div className="space-y-6 mt-2">
            {sortedActivities.map((activity, idx) => {
              const { color, bg, border, icon: Icon } = getEventStyle(activity.action, activity.status);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                  className="relative pl-8"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-[-5px] top-3 p-1 rounded-full border-2 ${bg} ${border} bg-background shadow-sm`}>
                    <Icon className={`w-3 h-3 ${color}`} />
                  </div>

                  {/* Event card */}
                  <div className={`p-3 rounded-xl border ${border} bg-card/50 hover:bg-muted/30 transition-colors group`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold">{activity.action}</span>
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(activity.time).toLocaleTimeString()}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto ${
                        activity.riskScore >= 80 ? 'bg-destructive/10 text-destructive' :
                        activity.riskScore >= 40 ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {activity.riskScore}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="w-3 h-3 shrink-0" />
                        <span>{activity.device}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="truncate">{activity.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{activity.location}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
