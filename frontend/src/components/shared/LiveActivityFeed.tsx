import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn, ShieldAlert, FileSearch, TerminalSquare, AlertTriangle, Key } from "lucide-react";
import type { Activity } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  activities: Activity[];
}

export function LiveActivityFeed({ activities }: Props) {
  const getIcon = (action: string) => {
    if (action.includes('Login')) return <LogIn className="w-4 h-4 text-blue-500" />;
    if (action.includes('File')) return <FileSearch className="w-4 h-4 text-purple-500" />;
    if (action.includes('Command')) return <TerminalSquare className="w-4 h-4 text-orange-500" />;
    if (action.includes('Database')) return <Key className="w-4 h-4 text-yellow-500" />;
    if (action.includes('Alert') || action.includes('Risk')) return <AlertTriangle className="w-4 h-4 text-destructive" />;
    return <ShieldAlert className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Card className="h-full flex flex-col backdrop-blur-md bg-background/60">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Live Feed
            </CardTitle>
            <CardDescription>Real-time event stream</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, height: 0, x: -20 }}
                animate={{ opacity: 1, height: 'auto', x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 bg-background rounded-full border shadow-sm shrink-0">
                  {getIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{activity.action}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap font-mono">
                      {new Date(activity.time).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.userId} • {activity.device}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
