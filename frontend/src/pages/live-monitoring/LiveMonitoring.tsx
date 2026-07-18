import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, RefreshCcw, UserMinus, ShieldAlert, Wifi } from "lucide-react";
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
      case 'Success': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Denied': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
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
        <h2 className="text-3xl font-bold tracking-tight text-gradient">Live Activity Monitoring</h2>
        <p className="text-muted-foreground">Real-time feed of privileged user activities and network events.</p>
      </motion.div>

      {/* Connection status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 text-xs text-muted-foreground bg-green-500/5 border border-green-500/10 rounded-full px-3 py-1.5 w-fit"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <Wifi className="w-3 h-3 text-green-500" />
        <span>Connected to live stream</span>
        <span className="text-green-500 font-medium">{filteredActivities.length} events</span>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="backdrop-blur-md bg-background/60 overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
              <div className="flex flex-1 gap-2">
                <div className="relative w-full md:max-w-xs group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search events, IP, Users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background/50 border-muted-foreground/15 focus:border-primary/30 h-9"
                  />
                </div>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[140px] bg-background/50 border-muted-foreground/15 h-9">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="w-full md:w-auto h-9 border-muted-foreground/15 hover:bg-muted/50">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Live Sync
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px] text-[11px] uppercase tracking-wider">Time</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">Identity</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">Event</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">Context</TableHead>
                      <TableHead className="text-right text-[11px] uppercase tracking-wider">Risk</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">Status</TableHead>
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
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            key={activity.id}
                            className="group hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                              {new Date(activity.time).toLocaleTimeString()}
                            </TableCell>
                            <TableCell className="font-medium text-sm">{activity.userId}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{activity.action}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">{activity.device}</span>
                                <span className="text-[11px] text-muted-foreground font-mono">{activity.ipAddress}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`font-bold text-sm inline-flex items-center gap-1 ${
                                activity.riskScore >= 80 ? 'text-destructive' :
                                activity.riskScore >= 40 ? 'text-yellow-500' : 'text-green-500'
                              }`}>
                                {activity.riskScore >= 80 && <ShieldAlert className="w-3 h-3" />}
                                {activity.riskScore}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] px-2 py-0 border ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <UserMinus className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <Search className="w-8 h-8 text-muted-foreground/30" />
                              <p>No activities matched your filters.</p>
                            </div>
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
