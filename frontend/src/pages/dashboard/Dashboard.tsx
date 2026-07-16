import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Users, ShieldAlert, AlertTriangle } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import type { Alert } from "@/types";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-destructive text-destructive-foreground';
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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">SOC Dashboard</h2>
        <p className="text-muted-foreground">Monitor privileged access, detect anomalies, and track insider threats.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.activeSessions.toLocaleString()}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-destructive">High Risk Users</CardTitle>
            <ShieldAlert className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-destructive">{stats?.highRiskUsers}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Today's Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.todaysAlerts}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Risk Trend</CardTitle>
            <CardDescription>Overall system risk score over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
            {riskAnalysis ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskAnalysis.trends}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-full w-full" />}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Users categorized by AI-predicted risk level.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Latest security incidents and anomalous behaviors.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertsLoading ? (
              [1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)
            ) : (
              alerts?.map((alert: Alert) => (
                <div key={alert.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <Badge className={getSeverityColor(alert.severity)} variant="outline">{alert.severity}</Badge>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{alert.ruleTriggered}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
