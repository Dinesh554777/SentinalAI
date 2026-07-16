import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, ShieldAlert, Target } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export function RiskAnalysis() {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['riskAnalysis', 'usr_3'],
    queryFn: () => api.getRiskAnalysis('usr_3')
  });

  const getPredictionColor = (pred: string) => {
    switch (pred) {
      case 'High': return 'text-destructive';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Risk Prediction</h2>
        <p className="text-muted-foreground">Deep learning insights into user behavior and potential insider threats.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Analysis Engine Verdict
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? <Skeleton className="h-40 w-full" /> : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Target Subject</h3>
                    <p className="text-xl font-bold">{analysis?.userId}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-medium text-muted-foreground">Predicted Risk</h3>
                    <p className={`text-2xl font-bold ${getPredictionColor(analysis?.prediction || '')}`}>
                      {analysis?.prediction}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">AI Confidence</span>
                    <span className="text-sm font-medium">{(analysis?.confidence || 0) * 100}%</span>
                  </div>
                  <Progress value={(analysis?.confidence || 0) * 100} className="h-2" />
                </div>

                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Reasoning
                  </h4>
                  <p className="text-sm text-muted-foreground">{analysis?.reason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Behavioral Timeline</CardTitle>
            <CardDescription>Risk score volatility over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
             {isLoading ? <Skeleton className="h-full w-full" /> : (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={analysis?.trends}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorScore)" />
                 </AreaChart>
               </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Action Plan</CardTitle>
          <CardDescription>Automated playbook based on risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? <Skeleton className="h-16 w-full" /> : (
             <div className="flex items-start gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
               <ShieldAlert className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
               <div className="space-y-1">
                 <p className="font-medium text-destructive">Immediate Action Required</p>
                 <p className="text-sm text-muted-foreground">{analysis?.recommendedAction}</p>
                 <div className="pt-2 flex gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-destructive hover:text-white">Execute Playbook</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">Dismiss</Badge>
                 </div>
               </div>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
