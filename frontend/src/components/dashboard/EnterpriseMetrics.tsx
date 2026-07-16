import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bug, CheckCircle, Crosshair, Target, Zap } from "lucide-react";
import type { EnterpriseMetrics as MetricsType } from "@/types";
import { motion } from "framer-motion";

interface Props {
  metrics: MetricsType;
}

export function EnterpriseMetrics({ metrics }: Props) {
  return (
    <Card className="backdrop-blur-md bg-background/60">
      <CardHeader>
        <CardTitle className="text-lg">Enterprise Security Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-card border flex flex-col gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Avg Risk Score</span>
            <span className="text-2xl font-bold">{metrics.averageRiskScore}</span>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-card border flex flex-col gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><Bug className="w-4 h-4 text-destructive" /> Open Incidents</span>
            <span className="text-2xl font-bold text-destructive">{metrics.openIncidents}</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-card border flex flex-col gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Resolved</span>
            <span className="text-2xl font-bold text-green-500">{metrics.resolvedIncidents}</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-card border flex flex-col gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> MTTD</span>
            <span className="text-2xl font-bold">{metrics.mttd}</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-card border flex flex-col gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><Target className="w-4 h-4" /> MTTR</span>
            <span className="text-2xl font-bold">{metrics.mttr}</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-card border flex flex-col gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><Crosshair className="w-4 h-4" /> Detection Accuracy</span>
            <span className="text-2xl font-bold">{metrics.detectionAccuracy}%</span>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
