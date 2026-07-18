import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, TrendingUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useDashboardStats, useRecentAlerts, useRiskAnalysis, useEnterpriseMetrics, useSecurityHealth, useThreats } from "@/hooks/useApi";
import { SecurityCommandCenter } from "@/components/dashboard/SecurityCommandCenter";
import { SecurityHealthPanel } from "@/components/dashboard/SecurityHealthPanel";
import { ThreatIntelligencePanel } from "@/components/dashboard/ThreatIntelligencePanel";
import { EnterpriseMetrics } from "@/components/dashboard/EnterpriseMetrics";

export function Dashboard() {
  const { data: stats } = useDashboardStats();
  const { data: alerts, isLoading: alertsLoading } = useRecentAlerts();
  const { data: riskAnalysis } = useRiskAnalysis("usr_3");
  const { data: enterpriseMetrics } = useEnterpriseMetrics();
  const { data: securityHealth } = useSecurityHealth();
  const { data: threats } = useThreats();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-muted';
    }
  };

  const pieData = stats ? [
    { name: 'Low Risk', value: stats.lowRiskUsers || 0, color: '#22c55e' },
    { name: 'Medium Risk', value: stats.mediumRiskUsers || 0, color: '#eab308' },
    { name: 'High Risk', value: stats.highRiskUsers || 0, color: '#ef4444' },
  ] : [
    { name: 'Low Risk', value: 0, color: '#22c55e' },
    { name: 'Medium Risk', value: 0, color: '#eab308' },
    { name: 'High Risk', value: 0, color: '#ef4444' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-3xl font-bold tracking-tight text-gradient">Security Command Center</h2>
        <p className="text-muted-foreground">Monitor privileged access, detect anomalies, and track insider threats.</p>
      </motion.div>

      {/* Command Center Stats */}
      {stats ? <SecurityCommandCenter stats={stats} /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      )}

      {/* Enterprise Metrics */}
      {enterpriseMetrics ? <EnterpriseMetrics metrics={enterpriseMetrics} /> : <Skeleton className="h-32 w-full rounded-xl" />}

      {/* Threat Intel + Security Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div
          className="col-span-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {threats ? <ThreatIntelligencePanel threats={threats} /> : <Skeleton className="h-[400px] w-full rounded-xl" />}
        </motion.div>
        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {securityHealth ? <SecurityHealthPanel health={securityHealth} /> : <Skeleton className="h-[400px] w-full rounded-xl" />}
        </motion.div>
      </div>

      {/* Risk Trend + Pie Chart */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div
          className="col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="backdrop-blur-md bg-background/60 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-primary" />
                Global Risk Trend
              </CardTitle>
              <CardDescription>Aggregate system risk score over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2 h-[300px]">
              {riskAnalysis ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskAnalysis.trends}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{r: 5, fill: "hsl(var(--background))", strokeWidth: 2, stroke: "hsl(var(--primary))"}}
                      activeDot={{r: 7, strokeWidth: 3, stroke: "hsl(var(--primary))"}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : <Skeleton className="h-full w-full rounded-xl" />}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="backdrop-blur-md bg-background/60 h-full">
            <CardHeader>
              <CardTitle className="text-base">Identity Risk Distribution</CardTitle>
              <CardDescription>Users categorized by AI-predicted risk level.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold">{stats?.totalUsers || '...'}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Identities</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="backdrop-blur-md bg-background/60 border-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Latest security incidents and anomalous behaviors.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertsLoading ? (
                [1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
              ) : (
                alerts?.map((alert, idx: number) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    key={alert.id}
                    className="flex items-start gap-3 rounded-xl border p-4 hover:bg-muted/30 transition-all duration-200 group"
                  >
                    <Badge className={`${getSeverityColor(alert.severity)} shadow-sm`} variant="outline">
                      {alert.severity}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-none truncate">{alert.ruleTriggered}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-lg shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
