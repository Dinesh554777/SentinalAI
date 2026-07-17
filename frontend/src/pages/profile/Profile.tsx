import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Mail, Briefcase, MapPin, Key, Bell, Lock } from "lucide-react";

export function Profile() {
  const userId = localStorage.getItem("sentinel_user_id") || "1";
  const userName = localStorage.getItem("sentinel_user_name") || "User";
  const userRole = localStorage.getItem("sentinel_role") || "Standard";

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId)
  });

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">Manage your account settings and security preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="backdrop-blur-md bg-background/60 md:col-span-1">
          <CardHeader className="text-center pb-2">
            {isLoading ? <Skeleton className="h-24 w-24 rounded-full mx-auto" /> : (
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background shadow-xl">
                <AvatarImage src={user?.avatar} alt={userName} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
            )}
            <CardTitle className="text-xl">{userName}</CardTitle>
            <Badge variant="outline" className="mt-2 w-max mx-auto bg-primary/10 text-primary border-primary/20">{userRole}</Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {isLoading ? (
              <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
            ) : user && (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.location}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security & Activity */}
        <div className="md:col-span-2 space-y-6">
          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your authentication and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Multi-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Enabled via Authenticator App</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Session Management</p>
                    <p className="text-xs text-muted-foreground">Review and revoke active sessions</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Login Notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified of new sign-ins</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your identity details from the security directory</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="text-sm font-mono font-medium mt-1">{userId}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm font-medium mt-1">{userRole}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className="mt-1 bg-green-500/20 text-green-500">Active</Badge>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground">MFA</p>
                    <Badge className="mt-1 bg-green-500/20 text-green-500">Enabled</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
