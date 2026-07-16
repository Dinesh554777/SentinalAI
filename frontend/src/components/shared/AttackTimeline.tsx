import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn, ShieldAlert, FileSearch, TerminalSquare, AlertTriangle, Key, ShieldCheck } from "lucide-react";
import type { Activity } from "@/types";
import { motion } from "framer-motion";

interface Props {
  activities: Activity[];
}

export function AttackTimeline({ activities }: Props) {
  const sortedActivities = [...activities].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const getEventStyle = (action: string, status: string) => {
    if (status === 'Denied') return { color: 'text-destructive', bg: 'bg-destructive/10', icon: <ShieldAlert className="w-4 h-4 text-destructive" /> };
    if (action.includes('Alert') || action.includes('Risk')) return { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> };
    if (action.includes('File')) return { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: <FileSearch className="w-4 h-4 text-purple-500" /> };
    if (action.includes('Command')) return { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <TerminalSquare className="w-4 h-4 text-blue-500" /> };
    if (action.includes('Database')) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: <Key className="w-4 h-4 text-yellow-500" /> };
    if (action.includes('Login')) return { color: 'text-green-500', bg: 'bg-green-500/10', icon: <LogIn className="w-4 h-4 text-green-500" /> };
    return { color: 'text-muted-foreground', bg: 'bg-muted', icon: <ShieldCheck className="w-4 h-4 text-muted-foreground" /> };
  };

  return (
    <Card className="h-full backdrop-blur-md bg-background/60">
      <CardHeader>
        <CardTitle>Behavior Timeline</CardTitle>
        <CardDescription>Chronological sequence of identity actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative border-l-2 border-muted ml-3 pl-6 space-y-8 mt-2">
          {sortedActivities.map((activity, idx) => {
            const style = getEventStyle(activity.action, activity.status);
            
            return (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                <div className={`absolute -left-[35px] top-0 p-1.5 rounded-full border shadow-sm bg-background ${style.color}`}>
                  {style.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{activity.action}</span>
                    <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 rounded">
                      {new Date(activity.time).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 bg-card border rounded-md p-3">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <div><span className="text-xs uppercase opacity-70">Device:</span> <br/>{activity.device}</div>
                      <div><span className="text-xs uppercase opacity-70">IP Address:</span> <br/>{activity.ipAddress}</div>
                      <div><span className="text-xs uppercase opacity-70">Location:</span> <br/>{activity.location}</div>
                      <div><span className="text-xs uppercase opacity-70">Risk Score:</span> <br/><span className={activity.riskScore > 80 ? 'text-destructive font-bold' : ''}>{activity.riskScore}</span></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
