import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Manage SentinelAI configurations and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize how the dashboard looks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-md">
                <Label>Theme</Label>
                <Select defaultValue="dark">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 max-w-md">
                <Label>Dashboard Refresh Rate</Label>
                <Select defaultValue="30s">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Refresh Rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10s">10 Seconds</SelectItem>
                    <SelectItem value="30s">30 Seconds</SelectItem>
                    <SelectItem value="60s">1 Minute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Alert Notifications</CardTitle>
              <CardDescription>Configure how you receive security alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="email-alert" defaultChecked />
                <Label htmlFor="email-alert">Email notifications for High Severity alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="sms-alert" />
                <Label htmlFor="sms-alert">SMS notifications for High Severity alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="daily-digest" defaultChecked />
                <Label htmlFor="daily-digest">Daily summary digest</Label>
              </div>
              <div className="pt-4">
                 <Button>Update Notifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>AI Detection Thresholds</CardTitle>
              <CardDescription>Adjust the sensitivity of SentinelAI anomaly detection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-md">
                <Label>High Risk Threshold (Score &gt; X)</Label>
                <Input type="number" defaultValue="80" />
              </div>
              <div className="space-y-2 max-w-md">
                <Label>Medium Risk Threshold (Score &gt; X)</Label>
                <Input type="number" defaultValue="40" />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox id="auto-suspend" />
                <Label htmlFor="auto-suspend">Automatically suspend accounts with score &gt; 95</Label>
              </div>
              <div className="pt-4">
                 <Button>Apply Thresholds</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
