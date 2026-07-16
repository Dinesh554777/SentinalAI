import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, ShieldCheck, Eye, EyeOff, Bot, Server, UserCog, Crosshair } from "lucide-react";
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
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-muted';
    }
  };

  const filteredAlerts = alerts?.filter(a => filter === "All" || a.severity === filter);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Security Alerts</h2>
        <p className="text-muted-foreground">Manage and respond to flagged security incidents.</p>
      </div>

      <Tabs defaultValue="All" onValueChange={setFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="All">All Alerts</TabsTrigger>
          <TabsTrigger value="Critical">Critical</TabsTrigger>
          <TabsTrigger value="High">High</TabsTrigger>
          <TabsTrigger value="Medium">Medium</TabsTrigger>
          <TabsTrigger value="Low">Low</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 m-0">
          <AnimatePresence>
            {isLoading ? (
               Array(4).fill(0).map((_, i) => (
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
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`backdrop-blur-md bg-background/60 ${alert.severity === 'Critical' || alert.severity === 'High' ? 'border-destructive/30 shadow-destructive/10 shadow-lg' : ''}`}>
                    <CardHeader className="flex flex-col md:flex-row md:items-start justify-between pb-2 gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <AlertTriangle className={`h-6 w-6 ${alert.severity === 'Critical' || alert.severity === 'High' ? 'text-destructive' : 'text-muted-foreground'}`} />
                          {alert.ruleTriggered}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-3">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{alert.id}</span>
                          <span>•</span>
                          <span className="font-medium text-foreground">{alert.userId}</span>
                          <span>•</span>
                          <span>{new Date(alert.time).toLocaleString()}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`text-sm px-3 py-1 ${getSeverityColor(alert.severity)}`}>{alert.severity}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm leading-relaxed">{alert.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {alert.aiRecommendation && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> AI Recommendation</h4>
                            <p className="text-sm">{alert.aiRecommendation}</p>
                          </div>
                        )}
                        <div className="bg-muted/30 border rounded-lg p-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> Affected Systems</h4>
                          <p className="text-sm font-medium">{alert.affectedSystems?.join(", ") || "Unknown"}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm mt-2">
                        {alert.mitreTechnique && (
                          <span className="flex items-center gap-1.5 text-muted-foreground"><Crosshair className="w-4 h-4" /> MITRE: <span className="font-mono font-medium text-foreground">{alert.mitreTechnique}</span></span>
                        )}
                        {alert.assignedAnalyst && (
                          <span className="flex items-center gap-1.5 text-muted-foreground"><UserCog className="w-4 h-4" /> Assigned To: <span className="font-medium text-foreground">{alert.assignedAnalyst}</span></span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2 pt-4 border-t mt-2">
                      <Button variant="default" size="sm" className="bg-primary text-primary-foreground">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Resolve Incident
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Start Investigation
                      </Button>
                      {!alert.assignedAnalyst && (
                        <Button variant="outline" size="sm">
                          <UserCog className="h-4 w-4 mr-2" />
                          Assign to Me
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground">
                        <EyeOff className="h-4 w-4 mr-2" />
                        Ignore
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
                <ShieldCheck className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No Alerts Found</h3>
                <p className="text-sm text-muted-foreground">Your environment is secure based on the current filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
