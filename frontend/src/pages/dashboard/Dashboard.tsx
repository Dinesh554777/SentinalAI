import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { dashboardService, securityHealthService, threatService } from "@/mock/services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import type { Alert } from "@/types";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// New Components
import { SecurityCommandCenter } from "@/components/dashboard/SecurityCommandCenter";
import { SecurityHealthPanel } from "@/components/dashboard/SecurityHealthPanel";
import { ThreatIntelligencePanel } from "@/components/dashboard/ThreatIntelligencePanel";
import { EnterpriseMetrics } from "@/components/dashboard/EnterpriseMetrics";

export function Dashboard() {
  // Existing hooks
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: api.getDashboard
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['recentAlerts'],
    queryFn: api.getAlerts
  });

  const { data: riskAnalysis } = useQuery({
    queryKey: ['riskAnalysis', 'usr_3'],
    queryFn: () => api.getRiskAnalysis('usr_3')
  });

  // New Hooks for Enterprise Features
  const { data: enterpriseMetrics } = useQuery({
    queryKey: ['enterpriseMetrics'],
    queryFn: dashboardService.getEnterpriseMetrics
  });

  const { data: securityHealth } = useQuery({
    queryKey: ['securityHealth'],
    queryFn: securityHealthService.getHealth
  });

  const { data: threats } = useQuery({
    queryKey: ['threats'],
    queryFn: threatService.getLatestThreats
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-muted';
    }
  };

  const pieData = [
    { name: 'Low Risk', value: 1200, color: '#22c55e' },
    { name: 'Medium Risk', value: 238, color: '#eab308' },
    { name: 'High Risk', value: 12, color: '#ef4444' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Security Command Center</h2>
        <p className="text-muted-foreground">Monitor privileged access, detect anomalies, and track insider threats.</p>
      </div>

      {/* Enterprise Top Banner */}
      {stats ? <SecurityCommandCenter stats={stats} /> : <Skeleton className="h-32 w-full" />}

      {/* Enterprise Metrics Summary */}
      {enterpriseMetrics ? <EnterpriseMetrics metrics={enterpriseMetrics} /> : <Skeleton className="h-32 w-full" />}

      {/* Health and Intelligence Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 h-full">
          {threats ? <ThreatIntelligencePanel threats={threats} /> : <Skeleton className="h-full w-full min-h-[300px]" />}
        </div>
        <div className="col-span-3 h-full">
          {securityHealth ? <SecurityHealthPanel health={securityHealth} /> : <Skeleton className="h-full w-full min-h-[300px]" />}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 backdrop-blur-md bg-background/60">
          <CardHeader>
            <CardTitle>Global Risk Trend</CardTitle>
            <CardDescription>Aggregate system risk score over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
            {riskAnalysis ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskAnalysis.trends}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: "hsl(var(--background))", strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-full w-full" />}
          </CardContent>
        </Card>

        <Card className="col-span-3 backdrop-blur-md bg-background/60">
          <CardHeader>
            <CardTitle>Identity Risk Distribution</CardTitle>
            <CardDescription>Users categorized by AI-predicted risk level.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold">{stats?.totalUsers ? (stats.totalUsers / 1000).toFixed(1) + 'k' : '...'}</span>
                <span className="text-xs text-muted-foreground uppercase">Identities</span>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="backdrop-blur-md bg-background/60 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            Recent Alerts
          </CardTitle>
          <CardDescription>Latest security incidents and anomalous behaviors.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertsLoading ? (
              [1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)
            ) : (
              alerts?.map((alert: Alert, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={alert.id} 
                  className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <Badge className={getSeverityColor(alert.severity)} variant="outline">{alert.severity}</Badge>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold leading-none">{alert.ruleTriggered}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
