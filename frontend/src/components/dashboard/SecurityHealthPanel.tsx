import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SecurityHealth } from "@/types";
import { ShieldCheck, Activity, Users, Lock, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

interface Props {
  health: SecurityHealth;
}

export function SecurityHealthPanel({ health }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    return "#ef4444";
  };

  const scoreColor = getScoreColor(health.overallScore);

  const scoreData = [
    { name: 'Score', value: health.overallScore, color: scoreColor },
    { name: 'Remaining', value: 100 - health.overallScore, color: 'hsl(var(--muted))' }
  ];

  const bars = [
    { label: "AI Detection Coverage", value: health.aiDetectionCoverage, icon: Activity, color: "bg-primary" },
    { label: "MFA Coverage", value: health.mfaCoverage, icon: Lock, color: "bg-blue-500" },
    { label: "Protected Accounts", value: health.protectedAccounts, icon: Users, color: "bg-green-500" },
  ];

  return (
    <Card className="h-full backdrop-blur-md bg-background/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Security Health
        </CardTitle>
        <CardDescription>Overall environment security posture</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Score circle */}
        <div className="flex flex-col items-center justify-center mb-6 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="h-36 w-36 relative"
          >
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 30px -5px ${scoreColor}33` }} />
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={64}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="text-3xl font-bold"
                style={{ color: scoreColor }}
              >
                {health.overallScore}%
              </motion.span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</span>
            </div>
          </motion.div>
        </div>

        {/* Progress bars */}
        <div className="space-y-4">
          {bars.map((bar, idx) => (
            <motion.div
              key={bar.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <bar.icon className="w-3.5 h-3.5" />
                  {bar.label}
                </span>
                <span className="font-semibold text-xs">{bar.value}%</span>
              </div>
              <div className="relative">
                <Progress value={bar.value} className="h-2 bg-muted/50" />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full ${bar.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${bar.value}%`, opacity: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-3 rounded-xl bg-muted/30 border border-border/50"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Privileged Accounts</p>
            <p className="text-2xl font-bold mt-1">{health.privilegedAccounts}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-3 rounded-xl bg-destructive/5 border border-destructive/10"
          >
            <p className="text-[10px] text-destructive/80 uppercase tracking-wider font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Open Incidents
            </p>
            <p className="text-2xl font-bold mt-1 text-destructive">{health.openIncidents}</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
