import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Mail, Briefcase, MapPin, Key, Bell, Lock, Activity, Shield, Clock, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

export function Profile() {
  const userId = localStorage.getItem("sentinel_user_id") || "1";
  const userName = localStorage.getItem("sentinel_user_name") || "User";
  const userRole = localStorage.getItem("sentinel_role") || "Standard";

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId)
  });

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const securityItems = [
    { icon: Key, label: "Password", desc: "Last changed 30 days ago", action: "Change", color: "text-blue-500" },
    { icon: ShieldCheck, label: "Multi-Factor Authentication", desc: "Enabled via Authenticator App", action: "Configure", color: "text-green-500" },
    { icon: Lock, label: "Session Management", desc: "Review and revoke active sessions", action: "Manage", color: "text-purple-500" },
    { icon: Bell, label: "Login Notifications", desc: "Get notified of new sign-ins", action: "Configure", color: "text-yellow-500" },
  ];

  const accountInfo = [
    { label: "User ID", value: userId, mono: true },
    { label: "Role", value: userRole },
    { label: "Status", value: "Active", badge: true, badgeColor: "bg-green-500/10 text-green-500 border-green-500/20" },
    { label: "MFA", value: "Enabled", badge: true, badgeColor: "bg-green-500/10 text-green-500 border-green-500/20" },
  ];

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
        <h2 className="text-3xl font-bold tracking-tight text-gradient">My Profile</h2>
        <p className="text-muted-foreground">Manage your account settings and security preferences.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-md bg-background/60 md:col-span-1 relative overflow-hidden">
            {/* Gradient top */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />

            <CardHeader className="text-center pb-2 relative">
              {isLoading ? (
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              ) : (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative mx-auto mb-4"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-glow-pulse" />
                  <Avatar className="w-24 h-24 mx-auto border-4 border-background shadow-xl relative">
                    <AvatarImage src={user?.avatar} alt={userName} />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-primary/5">{initials}</AvatarFallback>
                  </Avatar>
                </motion.div>
              )}
              <CardTitle className="text-xl">{userName}</CardTitle>
              <Badge variant="outline" className="mt-2 w-max mx-auto bg-primary/10 text-primary border-primary/20">
                {userRole}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 relative">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : user && (
                <>
                  <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{user.department}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{user.location}</span>
                  </div>
                </>
              )}

              {/* Risk Score */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4"
              >
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Risk Score</span>
                  <div className={`text-4xl font-black ${
                    (user?.riskScore || 0) >= 80 ? 'text-destructive' :
                    (user?.riskScore || 0) >= 40 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {user?.riskScore || 0}
                  </div>
                  <div className="w-full mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        (user?.riskScore || 0) >= 80 ? 'bg-destructive' :
                        (user?.riskScore || 0) >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${user?.riskScore || 0}%`, opacity: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security & Activity */}
        <div className="md:col-span-2 space-y-6">
          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your authentication and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {securityItems.map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted/50 ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-muted-foreground/15 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.action}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  Account Information
                </CardTitle>
                <CardDescription>Your identity details from the security directory</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {accountInfo.map((info, idx) => (
                      <motion.div
                        key={info.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.05 }}
                        className="p-3 rounded-xl bg-muted/20 border border-border/50"
                      >
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{info.label}</p>
                        {info.badge ? (
                          <Badge className={`mt-1.5 text-[10px] ${info.badgeColor}`}>{info.value}</Badge>
                        ) : (
                          <p className={`text-sm font-medium mt-1 ${info.mono ? 'font-mono' : ''}`}>{info.value}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
