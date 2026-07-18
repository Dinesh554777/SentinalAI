import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, ShieldCheck, Eye, EyeOff, Bot, Server, UserCog, Crosshair, Clock } from "lucide-react";
import type { Alert } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export function Alerts() {
  const [filter, setFilter] = useState("All");

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: api.getAlerts
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20';
      case 'High': return 'bg-orange-500 text-white shadow-lg shadow-orange-500/20';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'border-destructive/30 shadow-destructive/5 shadow-lg';
      case 'High': return 'border-orange-500/20';
      default: return '';
    }
  };

  const filteredAlerts = alerts?.filter(a => filter === "All" || a.severity === filter);

  const alertCounts = {
    All: alerts?.length || 0,
    Critical: alerts?.filter(a => a.severity === 'Critical').length || 0,
    High: alerts?.filter(a => a.severity === 'High').length || 0,
    Medium: alerts?.filter(a => a.severity === 'Medium').length || 0,
    Low: alerts?.filter(a => a.severity === 'Low').length || 0,
  };

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
        <h2 className="text-3xl font-bold tracking-tight text-gradient">Security Alerts</h2>
        <p className="text-muted-foreground">Manage and respond to flagged security incidents.</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(alertCounts).map(([key, count], idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-200 ${
              filter === key
                ? 'bg-primary/10 border-primary/20 shadow-md shadow-primary/5'
                : 'bg-card/50 border-border/50 hover:bg-muted/30'
            }`}
            onClick={() => setFilter(key)}
          >
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{key}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="All" onValueChange={setFilter}>
        <TabsList className="mb-4 bg-muted/30">
          {Object.keys(alertCounts).map(key => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {key}
              {alertCounts[key as keyof typeof alertCounts] > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 h-4">
                  {alertCounts[key as keyof typeof alertCounts]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter} className="space-y-3 m-0">
          <AnimatePresence>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={`skel-${i}`} className="backdrop-blur-md bg-background/60">
                  <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                  <CardContent><Skeleton className="h-12 w-full" /></CardContent>
                </Card>
              ))
            ) : filteredAlerts?.length ? (
              filteredAlerts.map((alert: Alert, idx: number) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.06, duration: 0.3 }}
                >
                  <Card className={`backdrop-blur-md bg-background/60 ${getSeverityBorder(alert.severity)} card-hover`}>
                    <CardHeader className="flex flex-col md:flex-row md:items-start justify-between pb-2 gap-3">
                      <div className="space-y-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            alert.severity === 'Critical' || alert.severity === 'High'
                              ? 'bg-destructive/10'
                              : 'bg-muted'
                          }`}>
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === 'Critical' || alert.severity === 'High'
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                            }`} />
                          </div>
                          {alert.ruleTriggered}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">{alert.id}</span>
                          <span className="text-muted-foreground/30">|</span>
                          <span className="font-medium text-foreground">{alert.userId}</span>
                          <span className="text-muted-foreground/30">|</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.time).toLocaleString()}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className={`text-xs px-3 py-1 shadow-sm ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">{alert.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {alert.aiRecommendation && (
                          <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1.5">
                              <Bot className="w-3 h-3" /> AI Recommendation
                            </h4>
                            <p className="text-sm text-muted-foreground">{alert.aiRecommendation}</p>
                          </div>
                        )}
                        <div className="bg-muted/20 border border-border/50 rounded-xl p-3">
                          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                            <Server className="w-3 h-3" /> Affected Systems
                          </h4>
                          <p className="text-sm font-medium">{alert.affectedSystems?.join(", ") || "Unknown"}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {alert.mitreTechnique && (
                          <span className="flex items-center gap-1.5">
                            <Crosshair className="w-3.5 h-3.5" />
                            MITRE: <span className="font-mono font-medium text-foreground">{alert.mitreTechnique}</span>
                          </span>
                        )}
                        {alert.assignedAnalyst && (
                          <span className="flex items-center gap-1.5">
                            <UserCog className="w-3.5 h-3.5" />
                            Assigned: <span className="font-medium text-foreground">{alert.assignedAnalyst}</span>
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2 pt-3 border-t mt-2">
                      <Button variant="default" size="sm" className="h-8 text-xs bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20">
                        <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                        Resolve
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs border-muted-foreground/15">
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Investigate
                      </Button>
                      {!alert.assignedAnalyst && (
                        <Button variant="outline" size="sm" className="h-8 text-xs border-muted-foreground/15">
                          <UserCog className="h-3.5 w-3.5 mr-1.5" />
                          Assign
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="ml-auto h-8 text-xs text-muted-foreground">
                        <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                        Ignore
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-muted/10">
                <div className="p-4 bg-green-500/10 rounded-2xl mb-4">
                  <ShieldCheck className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-lg font-medium">No Alerts Found</h3>
                <p className="text-sm text-muted-foreground mt-1">Your environment is secure based on the current filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
