import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShieldAlert, Laptop, ShieldCheck, Activity, Clock } from "lucide-react";
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
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-24 text-center"
      >
        <div className="p-4 bg-muted/30 rounded-2xl mb-4">
          <ShieldAlert className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-bold">Identity Not Found</h2>
        <p className="text-muted-foreground mt-1">The requested user could not be located.</p>
        <Button asChild className="mt-6 h-10 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20">
          <Link to="/users"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory</Link>
        </Button>
      </motion.div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBg = (score: number) => {
    if (score >= 80) return 'bg-destructive';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="shrink-0 h-9 w-9 border-muted-foreground/15">
          <Link to="/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gradient">Identity Profile</h2>
          <p className="text-muted-foreground text-sm">Detailed risk and activity breakdown for {user.name}</p>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-4">
        {/* Profile Summary Card */}
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-md bg-background/60 relative overflow-hidden">
            {/* Gradient top */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/10 to-transparent" />

            <CardHeader className="text-center pb-2 relative">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative mx-auto mb-3"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                <Avatar className="w-20 h-20 mx-auto border-4 border-background shadow-xl relative">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 font-semibold">
                    {user.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">{user.id} • {user.email}</p>
              <Badge variant="outline" className="mt-2 w-max mx-auto bg-primary/10 text-primary border-primary/20 text-[10px]">
                {user.role}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-2 pt-3 relative">
              {[
                { label: "Department", value: user.department },
                { label: "Location", value: user.location },
                { label: "Status", value: user.status, badge: true, badgeColor: user.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : '' },
              ].map((item, idx) => (
                <div key={item.label} className="flex justify-between items-center py-2 px-1">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  {item.badge ? (
                    <Badge variant="outline" className={`text-[10px] ${item.badgeColor}`}>{item.value}</Badge>
                  ) : (
                    <span className="text-sm font-medium">{item.value}</span>
                  )}
                </div>
              ))}

              <div className="flex justify-between items-center py-2 px-1 border-t">
                <span className="text-xs text-muted-foreground">MFA Status</span>
                {user.mfaEnabled ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Enforced
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                    <ShieldAlert className="w-3 h-3 mr-1" /> Disabled
                  </Badge>
                )}
              </div>

              {/* Risk Score */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-3"
              >
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Risk Score</span>
                  <div className={`text-4xl font-black ${getRiskColor(user.riskScore)}`}>
                    {user.riskScore}
                  </div>
                  <div className="w-full mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getRiskBg(user.riskScore)}`}
                      style={{ width: `${user.riskScore}%`, opacity: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Known Devices */}
              <div className="pt-3">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                  <Laptop className="w-3.5 h-3.5" /> Known Devices
                </h4>
                <div className="space-y-1.5">
                  {user.recentDevices?.map((device, idx) => (
                    <div key={idx} className="text-xs bg-muted/30 p-2 rounded-lg border border-border/50 flex items-center justify-between">
                      <span>{device}</span>
                      {idx === 0 && <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">Primary</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity & Alerts Column */}
        <div className="md:col-span-2 xl:col-span-3 space-y-6">
          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  Active Alerts for {user.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : userAlerts?.length ? (
                  <div className="space-y-3">
                    {userAlerts.map((alert: Alert, idx: number) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="p-3 rounded-xl border bg-card/50 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{alert.ruleTriggered}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              alert.severity === 'Critical' || alert.severity === 'High'
                                ? 'text-destructive border-destructive/30 bg-destructive/10'
                                : ''
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono mt-2">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.time).toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                    <ShieldCheck className="w-4 h-4" /> No active alerts for this identity.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {activitiesLoading ? (
              <Skeleton className="h-[400px] w-full rounded-xl" />
            ) : userActivities?.length ? (
              <AttackTimeline activities={userActivities} />
            ) : (
              <Card className="backdrop-blur-md bg-background/60">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p>No recent activities recorded.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
