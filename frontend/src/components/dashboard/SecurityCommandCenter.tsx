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
      case 'High': return 'from-destructive/10 to-destructive/5 border-destructive/20';
      case 'Medium': return 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20';
      case 'Low': return 'from-green-500/10 to-green-500/5 border-green-500/20';
    }
  };

  const cards = [
    {
      title: "Current Threat Level",
      value: stats.threatLevel,
      icon: stats.threatLevel === 'High' ? ShieldAlert : ShieldCheck,
      iconColor: getThreatColor(stats.threatLevel),
      gradient: getThreatBg(stats.threatLevel),
      isThreat: true,
      footer: { label: "SOC Status", value: "Operational", badge: true },
    },
    {
      title: "AI Engine Status",
      value: stats.aiStatus,
      icon: Cpu,
      iconColor: "text-primary",
      gradient: "from-primary/10 to-primary/5 border-primary/20",
      footer: { label: "Last Deep Scan", value: "2 min ago" },
    },
    {
      title: "Protected Endpoints",
      value: (stats.protectedEndpoints || 0).toLocaleString(),
      icon: Laptop,
      iconColor: "text-blue-500",
      gradient: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
      footer: { label: "Servers Secured", value: `${(stats.protectedServers || 0).toLocaleString()}`, icon: Server },
    },
    {
      title: "Active Sessions",
      value: stats.activeSessions.toLocaleString(),
      icon: Activity,
      iconColor: "text-emerald-500",
      gradient: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
      footer: { label: "Connected Sensors", value: `${stats.connectedSensors}`, icon: ActivitySquare },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className={`border bg-gradient-to-br ${card.gradient} backdrop-blur-md card-hover relative overflow-hidden`}>
            {/* Glow effect for threat level */}
            {card.isThreat && stats.threatLevel === 'High' && (
              <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5 animate-gradient opacity-50" />
            )}

            <CardContent className="p-5 relative">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.title}
                  </p>
                  <div className="flex items-center gap-2">
                    {card.isThreat ? (
                      <span className={`text-3xl font-black uppercase tracking-tighter ${getThreatColor(stats.threatLevel)}`}>
                        {stats.threatLevel}
                      </span>
                    ) : (
                      <span className="text-3xl font-bold tracking-tight">{card.value}</span>
                    )}
                    <card.icon className={`w-6 h-6 ${card.iconColor} ${
                      card.isThreat && stats.threatLevel === 'High' ? 'animate-pulse' : ''
                    }`} />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex justify-between text-xs">
                <span className="text-muted-foreground">{card.footer.label}</span>
                {card.footer.badge ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] px-2 py-0">
                    {card.footer.value}
                  </Badge>
                ) : (
                  <span className="font-medium flex items-center gap-1">
                    {card.footer.icon && <card.footer.icon className="w-3 h-3" />}
                    {card.footer.value}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
