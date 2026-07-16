import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShieldAlert, Laptop, ShieldCheck } from "lucide-react";
import type { Alert } from "@/types";
import { motion } from "framer-motion";
import { AttackTimeline } from "@/components/shared/AttackTimeline";

export function UserDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.getUser(id!)
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['recentAlerts'],
    queryFn: api.getAlerts
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: api.getActivities
  });

  const userAlerts = alerts?.filter(a => a.userId === id);
  const userActivities = activities?.filter(a => a.userId === id);

  if (userLoading) {
    return <div className="p-8 space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <h2 className="text-2xl font-bold">Identity Not Found</h2>
        <Button asChild className="mt-4"><Link to="/users">Back to Directory</Link></Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="shrink-0 bg-background/50">
          <Link to="/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Identity Profile</h2>
          <p className="text-muted-foreground">Detailed risk and activity breakdown for {user.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-4">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1 xl:col-span-1 backdrop-blur-md bg-background/60">
          <CardHeader className="text-center pb-2">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background shadow-xl">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription className="font-mono text-xs mt-1">{user.id} • {user.email}</CardDescription>
            <Badge variant="outline" className="mt-4 w-max mx-auto bg-primary/10 text-primary border-primary/20">{user.role}</Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Department</span>
              <span className="text-sm font-medium">{user.department}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Location</span>
              <span className="text-sm font-medium">{user.location}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>{user.status}</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">MFA Status</span>
              {user.mfaEnabled ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><ShieldCheck className="w-3 h-3 mr-1" /> Enforced</Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><ShieldAlert className="w-3 h-3 mr-1" /> Disabled</Badge>
              )}
            </div>
            <div className="pt-4 p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center border">
               <span className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Current Risk Score</span>
               <div className={`text-5xl font-black ${user.riskScore >= 80 ? 'text-destructive' : user.riskScore >= 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                 {user.riskScore}
               </div>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Laptop className="w-4 h-4" /> Known Devices</h4>
              <div className="space-y-2">
                {user.recentDevices?.map((device, idx) => (
                  <div key={idx} className="text-xs bg-muted/50 p-2 rounded border flex items-center justify-between">
                    <span>{device}</span>
                    {idx === 0 && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Primary</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity & Alerts Column */}
        <div className="md:col-span-2 xl:col-span-3 space-y-6">
          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Active Alerts for {user.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertsLoading ? <Skeleton className="h-20 w-full" /> : userAlerts?.length ? (
                <div className="space-y-4">
                  {userAlerts.map((alert: Alert) => (
                    <div key={alert.id} className="flex flex-col gap-1 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{alert.ruleTriggered}</span>
                        <Badge variant="outline" className={alert.severity === 'Critical' || alert.severity === 'High' ? 'text-destructive border-destructive/50 bg-destructive/10' : ''}>{alert.severity}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{alert.description}</span>
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded w-max mt-1">{new Date(alert.time).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                  <ShieldCheck className="w-5 h-5" /> No active alerts for this identity.
                </div>
              )}
            </CardContent>
          </Card>

          {activitiesLoading ? <Skeleton className="h-[400px] w-full" /> : userActivities?.length ? (
            <AttackTimeline activities={userActivities} />
          ) : (
            <Card className="backdrop-blur-md bg-background/60">
              <CardContent className="p-12 text-center text-muted-foreground">
                No recent activities recorded.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
