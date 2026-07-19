import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, ShieldAlert, Eye, Users as UsersIcon, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";
import { motion } from "framer-motion";

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers
  });

  const getRiskColor = (score: number) => {
    if (score > 80) return 'text-destructive';
    if (score > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBg = (score: number) => {
    if (score > 80) return 'bg-destructive';
    if (score > 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLevel = (score: number) => {
    if (score > 80) return 'High';
    if (score > 40) return 'Medium';
    return 'Low';
  };

  const filteredUsers = users?.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = users?.filter(u => u.status === 'Active').length || 0;
  const highRiskCount = users?.filter(u => u.riskScore > 80).length || 0;

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
        <h2 className="text-3xl font-bold tracking-tight text-gradient">User Management</h2>
        <p className="text-muted-foreground">Manage privileged identities and review risk profiles.</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3"
        >
          <div className="p-2 bg-primary/10 rounded-lg">
            <UsersIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Users</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center gap-3"
        >
          <div className="p-2 bg-green-500/10 rounded-lg">
            <UserCheck className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{activeCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 flex items-center gap-3"
        >
          <div className="p-2 bg-destructive/10 rounded-lg">
            <UserX className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">{highRiskCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">High Risk</p>
          </div>
        </motion.div>
      </div>

      {/* Users table */}
      <Card className="backdrop-blur-md bg-background/60">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-base">Directory</CardTitle>
          <div className="relative w-full md:w-1/3 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50 border-muted-foreground/15 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wider">User</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider">Department</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider">Role</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider">Risk Score</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers?.length ? (
                  filteredUsers.map((user: User, idx: number) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={user.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-offset-background" style={{
                            ringColor: user.riskScore > 80 ? 'hsl(0 84.2% 60.2%)' : user.riskScore > 40 ? 'hsl(45 93% 47%)' : 'hsl(142 71% 45%)'
                          }}>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold">
                              {user.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.name}</span>
                            <span className="text-[11px] text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.department}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] font-medium">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 max-w-[80px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-bold ${getRiskColor(user.riskScore)}`}>
                                {user.riskScore}
                              </span>
                              <span className="text-[9px] text-muted-foreground uppercase">{getRiskLevel(user.riskScore)}</span>
                            </div>
                            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getRiskBg(user.riskScore)} transition-all duration-700`}
                                style={{ width: `${user.riskScore}%`, opacity: 0.8 }}
                              />
                            </div>
                          </div>
                          {user.riskScore > 80 && <ShieldAlert className="h-4 w-4 text-destructive animate-pulse" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'Active' ? 'default' : 'secondary'}
                          className={`text-[10px] ${
                            user.status === 'Active'
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : ''
                          }`}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-strong">
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link to={`/users/${user.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => toast({ title: "Edit Access", description: `Editing access for ${user.name}.` })}
                            >
                              Edit Access
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => toast({ title: "Account Suspended", description: `${user.name}'s account has been suspended.`, variant: "destructive" })}
                            >
                              Suspend Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-muted-foreground/30" />
                        <p>No users found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
