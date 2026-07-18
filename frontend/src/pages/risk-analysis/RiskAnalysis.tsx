import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { predictionApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { motion } from "framer-motion";
import { AIExplainabilityPanel } from "@/components/dashboard/AIExplainabilityPanel";
import { AttackTimeline } from "@/components/shared/AttackTimeline";
import { Activity, Radar as RadarIcon } from "lucide-react";

const FEATURE_LABELS: Record<string, string> = {
  files_downloaded: 'File Volume',
  commands_executed: 'Commands',
  failed_logins: 'Failed Logins',
  new_location: 'Location',
  new_device: 'Device',
  session_duration: 'Session',
  login_hour: 'Time',
  weekend_login: 'Weekend',
};

export function RiskAnalysis() {
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['riskAnalysis', 'usr_3'],
    queryFn: () => api.getRiskAnalysis('usr_3')
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: api.getActivities
  });

  const { data: featureImportance, isLoading: fiLoading } = useQuery({
    queryKey: ['featureImportance'],
    queryFn: predictionApi.getFeatureImportance,
  });

  const radarData = featureImportance
    ? Object.entries(featureImportance)
        .map(([key, value]) => ({
          subject: FEATURE_LABELS[key] || key,
          A: Math.round((value as number) * 500),
          fullMark: 100,
        }))
        .sort((a, b) => b.A - a.A)
    : [
        { subject: 'File Volume', A: 21, fullMark: 100 },
        { subject: 'Commands', A: 17, fullMark: 100 },
        { subject: 'Failed Logins', A: 15, fullMark: 100 },
        { subject: 'Location', A: 13, fullMark: 100 },
        { subject: 'Device', A: 12, fullMark: 100 },
        { subject: 'Session', A: 9, fullMark: 100 },
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
        className="flex flex-col gap-2"
      >
        <h2 className="text-3xl font-bold tracking-tight text-gradient">AI Risk Analysis</h2>
        <p className="text-muted-foreground">Deep learning insights into user behavior and potential insider threats.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Explainability Panel */}
        <motion.div
          className="xl:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {analysisLoading || !analysis ? <Skeleton className="h-full min-h-[400px] w-full rounded-xl" /> : (
            <AIExplainabilityPanel analysis={analysis} />
          )}
        </motion.div>

        {/* Charts Section */}
        <div className="xl:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4 text-primary" />
                  Behavioral Risk Volatility
                </CardTitle>
                <CardDescription>Risk score fluctuation mapped over the historical baseline</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {analysisLoading ? <Skeleton className="h-full w-full rounded-xl" /> : (
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        activeDot={{r: 6, strokeWidth: 3, stroke: "hsl(var(--destructive))"}}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <RadarIcon className="w-4 h-4 text-primary" />
                  Threat Vector Topology
                </CardTitle>
                <CardDescription>Model feature importance — weighted influence on risk classification</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {fiLoading ? (
                  <Skeleton className="h-full w-full rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <Radar
                        name="Feature Importance"
                        dataKey="A"
                        stroke="hsl(var(--destructive))"
                        fill="hsl(var(--destructive))"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Attack Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        {activitiesLoading || !activities ? <Skeleton className="h-[400px] w-full rounded-xl" /> : (
          <AttackTimeline activities={activities} />
        )}
      </motion.div>
    </motion.div>
  );
}
