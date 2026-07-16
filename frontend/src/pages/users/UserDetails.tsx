import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShieldAlert, Activity, LogIn, HardDrive } from "lucide-react";
import type { Alert, Activity as ActivityType } from "@/types";

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
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <Button asChild className="mt-4"><Link to="/users">Back to Directory</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
          <p className="text-muted-foreground">Detailed risk and activity breakdown for {user.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <Badge variant="outline" className="mt-2">{user.role}</Badge>
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
              <span className="text-sm text-muted-foreground">MFA Enabled</span>
              <Badge variant={user.mfaEnabled ? 'default' : 'destructive'}>{user.mfaEnabled ? 'Yes' : 'No'}</Badge>
            </div>
            <div className="pt-4 p-4 bg-muted rounded-lg flex flex-col items-center justify-center">
               <span className="text-sm text-muted-foreground mb-1">Current Risk Score</span>
               <div className={`text-4xl font-bold ${user.riskScore > 80 ? 'text-destructive' : user.riskScore > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                 {user.riskScore}
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity & Alerts Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertsLoading ? <Skeleton className="h-20 w-full" /> : userAlerts?.length ? (
                <div className="space-y-4">
                  {userAlerts.map((alert: Alert) => (
                    <div key={alert.id} className="flex flex-col gap-1 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{alert.ruleTriggered}</span>
                        <Badge variant="outline" className={alert.severity === 'High' ? 'text-destructive border-destructive/50' : ''}>{alert.severity}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{alert.description}</span>
                      <span className="text-xs text-muted-foreground">{new Date(alert.time).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent alerts for this user.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? <Skeleton className="h-40 w-full" /> : userActivities?.length ? (
                <div className="relative border-l ml-3 pl-4 space-y-6">
                  {userActivities.map((activity: ActivityType) => (
                    <div key={activity.id} className="relative">
                      <div className="absolute -left-6 bg-background rounded-full border p-1">
                        {activity.action.includes('Login') ? <LogIn className="w-3 h-3 text-muted-foreground" /> : <HardDrive className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{activity.action}</span>
                        <span className="text-xs text-muted-foreground">Device: {activity.device} | IP: {activity.ipAddress}</span>
                        <span className="text-xs text-muted-foreground">{new Date(activity.time).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activities recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
