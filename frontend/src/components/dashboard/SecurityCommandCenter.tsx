import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Cpu, Activity, Server, Laptop, ActivitySquare } from "lucide-react";
import type { DashboardStats, RiskLevel } from "@/types";
import { motion } from "framer-motion";

interface Props {
  stats: DashboardStats;
}

export function SecurityCommandCenter({ stats }: Props) {
  const getThreatColor = (level: RiskLevel = 'Low') => {
    switch(level) {
      case 'High': return 'text-destructive';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
    }
  };

  const getThreatBg = (level: RiskLevel = 'Low') => {
    switch(level) {
      case 'High': return 'bg-destructive/10 border-destructive/20';
      case 'Medium': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card className={`border-2 ${getThreatBg(stats.threatLevel)} backdrop-blur-md bg-background/60`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Threat Level</p>
                <div className="flex items-center gap-2">
                  <span className={`text-4xl font-black uppercase tracking-tighter ${getThreatColor(stats.threatLevel)}`}>
                    {stats.threatLevel}
                  </span>
                  {stats.threatLevel === 'High' ? <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" /> : <ShieldCheck className="w-8 h-8 text-green-500" />}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">SOC Status</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Operational</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card className="backdrop-blur-md bg-background/60">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AI Engine Status</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold tracking-tight">{stats.aiStatus}</span>
                  <Cpu className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Last Deep Scan</span>
              <span className="font-medium">2 minutes ago</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <Card className="backdrop-blur-md bg-background/60">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Protected Endpoints</p>
                <div className="text-3xl font-bold tracking-tight">{(stats.protectedEndpoints || 0).toLocaleString()}</div>
              </div>
              <Laptop className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Servers Secured</span>
              <span className="font-medium flex items-center gap-1"><Server className="w-3 h-3" /> {(stats.protectedServers || 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
        <Card className="backdrop-blur-md bg-background/60">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Sessions</p>
                <div className="text-3xl font-bold tracking-tight">{stats.activeSessions.toLocaleString()}</div>
              </div>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Connected Sensors</span>
              <span className="font-medium flex items-center gap-1"><ActivitySquare className="w-3 h-3" /> {stats.connectedSensors}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
