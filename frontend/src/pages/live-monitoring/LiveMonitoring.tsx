import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, RefreshCcw, Filter } from "lucide-react";
import type { Activity } from "@/types";

export function LiveMonitoring() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['activities'],
    queryFn: api.getActivities
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-500/20 text-green-500';
      case 'Failed': return 'bg-red-500/20 text-red-500';
      case 'Denied': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-muted';
    }
  };

  const filteredActivities = activities?.filter(a => 
    a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.ipAddress.includes(searchTerm) ||
    a.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Live Monitoring</h2>
        <p className="text-muted-foreground">Real-time feed of privileged user activities and network events.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex gap-2 w-full md:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-6 p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Device/IP</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Risk Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredActivities?.length ? (
                  filteredActivities.map((activity: Activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(activity.time).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="font-medium">{activity.userId}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{activity.device}</span>
                          <span className="text-xs text-muted-foreground">{activity.ipAddress}</span>
                        </div>
                      </TableCell>
                      <TableCell>{activity.location}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${activity.riskScore > 80 ? 'text-destructive' : activity.riskScore > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {activity.riskScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No activities found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
