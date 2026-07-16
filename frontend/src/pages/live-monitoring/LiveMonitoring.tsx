import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, RefreshCcw, Filter, UserMinus, ShieldAlert } from "lucide-react";
import type { Activity } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { LiveActivityFeed } from "@/components/shared/LiveActivityFeed";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LiveMonitoring() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [liveStream, setLiveStream] = useState<Activity[]>([]);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['activities'],
    queryFn: api.getActivities
  });

  useEffect(() => {
    if (activities) {
      setLiveStream(activities);
    }
  }, [activities]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-500/20 text-green-500';
      case 'Failed': return 'bg-red-500/20 text-red-500';
      case 'Denied': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-muted';
    }
  };

  const filteredActivities = liveStream.filter(a => {
    const matchesSearch = a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.ipAddress.includes(searchTerm) ||
                          a.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesRisk = true;
    if (riskFilter === "high") matchesRisk = a.riskScore >= 80;
    if (riskFilter === "medium") matchesRisk = a.riskScore >= 40 && a.riskScore < 80;
    if (riskFilter === "low") matchesRisk = a.riskScore < 40;

    return matchesSearch && matchesRisk;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Live Activity Monitoring</h2>
        <p className="text-muted-foreground">Real-time feed of privileged user activities and network events.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
              <div className="flex flex-1 gap-2">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events, IP, Users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-background/50"
                  />
                </div>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[140px] bg-background/50">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="hidden sm:flex"><Filter className="h-4 w-4" /></Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="w-full md:w-auto">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Live Sync
              </Button>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[100px]">Time</TableHead>
                      <TableHead>Identity</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Context (Device/IP)</TableHead>
                      <TableHead className="text-right">Risk</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={`skeleton-${i}`}>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        ))
                      ) : filteredActivities?.length ? (
                        filteredActivities.map((activity: Activity) => (
                          <motion.tr 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            key={activity.id}
                            className="group hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                              {new Date(activity.time).toLocaleTimeString()}
                            </TableCell>
                            <TableCell className="font-medium">{activity.userId}</TableCell>
                            <TableCell className="text-sm">{activity.action}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">{activity.device}</span>
                                <span className="text-xs text-muted-foreground font-mono">{activity.ipAddress} • {activity.location}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`font-bold inline-flex items-center gap-1 ${activity.riskScore >= 80 ? 'text-destructive' : activity.riskScore >= 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                                {activity.riskScore >= 80 && <ShieldAlert className="w-3 h-3" />}
                                {activity.riskScore}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(activity.status)}>
                                {activity.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10">
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                            No activities matched your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 h-full">
          <LiveActivityFeed activities={liveStream} />
        </div>
      </div>
    </motion.div>
  );
}
