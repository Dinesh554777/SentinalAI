import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import type { Alert } from "@/types";

export function Alerts() {
  const [filter, setFilter] = useState("All");

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: api.getAlerts
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-destructive text-destructive-foreground';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-muted';
    }
  };

  const filteredAlerts = alerts?.filter(a => filter === "All" || a.severity === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Security Alerts</h2>
        <p className="text-muted-foreground">Manage and respond to flagged security incidents.</p>
      </div>

      <Tabs defaultValue="All" onValueChange={setFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="All">All Alerts</TabsTrigger>
          <TabsTrigger value="High">High Severity</TabsTrigger>
          <TabsTrigger value="Medium">Medium Severity</TabsTrigger>
          <TabsTrigger value="Low">Low Severity</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 m-0">
          {isLoading ? (
             Array(4).fill(0).map((_, i) => (
               <Card key={i}>
                 <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                 <CardContent><Skeleton className="h-4 w-full" /></CardContent>
               </Card>
             ))
          ) : filteredAlerts?.length ? (
            filteredAlerts.map((alert: Alert) => (
              <Card key={alert.id} className={alert.severity === 'High' ? 'border-destructive/50' : ''}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${alert.severity === 'High' ? 'text-destructive' : 'text-muted-foreground'}`} />
                      {alert.ruleTriggered}
                    </CardTitle>
                    <CardDescription>Alert ID: {alert.id} • User: {alert.userId} • {new Date(alert.time).toLocaleString()}</CardDescription>
                  </div>
                  <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{alert.description}</p>
                </CardContent>
                <CardFooter className="flex gap-2 pt-2 border-t mt-4">
                  <Button variant="default" size="sm" className="bg-primary text-primary-foreground">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Investigate
                  </Button>
                  <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground">
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ignore
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
              <ShieldCheck className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium">No Alerts Found</h3>
              <p className="text-sm text-muted-foreground">Your environment is secure based on the current filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
