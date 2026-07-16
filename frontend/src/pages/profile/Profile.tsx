import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Mail, Briefcase, MapPin, Key } from "lucide-react";

export function Profile() {
  // Hardcoded to SOC01 for demo purposes
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'usr_5'],
    queryFn: () => api.getUser('usr_5')
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">Manage your analyst account settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-40 w-full" /> : user && (
               <div className="flex flex-col gap-6">
                 <div className="flex items-center gap-4">
                   <Avatar className="h-16 w-16">
                     <AvatarImage src={user.avatar} />
                     <AvatarFallback>SA</AvatarFallback>
                   </Avatar>
                   <div>
                     <h3 className="text-lg font-semibold">{user.name}</h3>
                     <p className="text-sm text-muted-foreground">{user.role}</p>
                   </div>
                   <Button variant="outline" className="ml-auto">Edit Profile</Button>
                 </div>
                 
                 <div className="space-y-4">
                   <div className="flex items-center gap-3 text-sm">
                     <Mail className="h-4 w-4 text-muted-foreground" />
                     <span>{user.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                     <Briefcase className="h-4 w-4 text-muted-foreground" />
                     <span>{user.department}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                     <MapPin className="h-4 w-4 text-muted-foreground" />
                     <span>{user.location}</span>
                   </div>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Preferences</CardTitle>
            <CardDescription>Manage your authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
