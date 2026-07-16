import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SecurityHealth } from "@/types";
import { ShieldCheck, Activity, Users, Lock, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Props {
  health: SecurityHealth;
}

export function SecurityHealthPanel({ health }: Props) {
  const scoreData = [
    { name: 'Score', value: health.overallScore, color: 'hsl(var(--primary))' },
    { name: 'Remaining', value: 100 - health.overallScore, color: 'hsl(var(--muted))' }
  ];

  return (
    <Card className="h-full backdrop-blur-md bg-background/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Security Health
        </CardTitle>
        <CardDescription>Overall environment security posture</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center mb-6 relative">
          <div className="h-32 w-32 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
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
              <span className="text-3xl font-bold">{health.overallScore}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground"><Activity className="w-4 h-4" /> AI Detection Coverage</span>
              <span className="font-medium">{health.aiDetectionCoverage}%</span>
            </div>
            <Progress value={health.aiDetectionCoverage} className="h-1.5" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground"><Lock className="w-4 h-4" /> MFA Coverage</span>
              <span className="font-medium">{health.mfaCoverage}%</span>
            </div>
            <Progress value={health.mfaCoverage} className="h-1.5" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" /> Protected Accounts</span>
              <span className="font-medium">{health.protectedAccounts}%</span>
            </div>
            <Progress value={health.protectedAccounts} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Privileged Accounts</p>
              <p className="text-xl font-semibold">{health.privilegedAccounts}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-destructive" /> Open Incidents</p>
              <p className="text-xl font-semibold text-destructive">{health.openIncidents}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
