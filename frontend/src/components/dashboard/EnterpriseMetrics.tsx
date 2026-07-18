import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bug, CheckCircle, Crosshair, Target, Zap, TrendingUp, TrendingDown } from "lucide-react";
import type { EnterpriseMetrics as MetricsType } from "@/types";
import { motion } from "framer-motion";

interface Props {
  metrics: MetricsType;
}

export function EnterpriseMetrics({ metrics }: Props) {
  const items = [
    {
      label: "Avg Risk Score",
      value: metrics.averageRiskScore,
      icon: Activity,
      iconColor: "text-primary",
      gradient: "from-primary/5 to-transparent",
      trend: "down" as const,
    },
    {
      label: "Open Incidents",
      value: metrics.openIncidents,
      icon: Bug,
      iconColor: "text-destructive",
      gradient: "from-destructive/5 to-transparent",
      trend: "up" as const,
    },
    {
      label: "Resolved",
      value: metrics.resolvedIncidents,
      icon: CheckCircle,
      iconColor: "text-green-500",
      gradient: "from-green-500/5 to-transparent",
      trend: "down" as const,
    },
    {
      label: "MTTD",
      value: metrics.mttd,
      icon: Zap,
      iconColor: "text-yellow-500",
      gradient: "from-yellow-500/5 to-transparent",
    },
    {
      label: "MTTR",
      value: metrics.mttr,
      icon: Target,
      iconColor: "text-blue-500",
      gradient: "from-blue-500/5 to-transparent",
    },
    {
      label: "Detection Accuracy",
      value: `${metrics.detectionAccuracy}%`,
      icon: Crosshair,
      iconColor: "text-purple-500",
      gradient: "from-purple-500/5 to-transparent",
      trend: "down" as const,
    },
  ];

  return (
    <Card className="backdrop-blur-md bg-background/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Enterprise Security Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`p-4 rounded-xl bg-gradient-to-br ${item.gradient} border border-border/50 flex flex-col gap-2 transition-shadow hover:shadow-md cursor-default`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <item.icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                  {item.label}
                </span>
                {item.trend && (
                  item.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-destructive" />
                  )
                )}
              </div>
              <span className="text-2xl font-bold tracking-tight">{item.value}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
