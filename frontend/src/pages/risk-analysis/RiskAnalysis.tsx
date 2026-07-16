import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { motion } from "framer-motion";
import { AIExplainabilityPanel } from "@/components/dashboard/AIExplainabilityPanel";
import { AttackTimeline } from "@/components/shared/AttackTimeline";
import { Activity } from "lucide-react";

export function RiskAnalysis() {
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['riskAnalysis', 'usr_3'],
    queryFn: () => api.getRiskAnalysis('usr_3')
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: api.getActivities
  });

  const radarData = [
    { subject: 'Location Anomaly', A: 85, fullMark: 100 },
    { subject: 'Time Deviation', A: 90, fullMark: 100 },
    { subject: 'Volume Spike', A: 95, fullMark: 100 },
    { subject: 'Failed Logins', A: 60, fullMark: 100 },
    { subject: 'Privilege Use', A: 75, fullMark: 100 },
    { subject: 'Device Anomaly', A: 80, fullMark: 100 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Risk Analysis</h2>
        <p className="text-muted-foreground">Deep learning insights into user behavior and potential insider threats.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Explainability Panel */}
        <div className="xl:col-span-1">
          {analysisLoading || !analysis ? <Skeleton className="h-full min-h-[400px] w-full" /> : (
            <AIExplainabilityPanel analysis={analysis} />
          )}
        </div>

        {/* Charts Section */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Behavioral Risk Volatility
              </CardTitle>
              <CardDescription>Risk score fluctuation mapped over the historical baseline</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
               {analysisLoading ? <Skeleton className="h-full w-full" /> : (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={analysis?.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="score" stroke="hsl(var(--destructive))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{r: 6}} />
                   </AreaChart>
                 </ResponsiveContainer>
               )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader>
              <CardTitle>Threat Vector Topology</CardTitle>
              <CardDescription>Multi-dimensional analysis of deviated behaviors</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Risk Vector" dataKey="A" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        {activitiesLoading || !activities ? <Skeleton className="h-[400px] w-full" /> : (
          <AttackTimeline activities={activities} />
        )}
      </div>
    </motion.div>
  );
}
