import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bell, Shield, Palette, Save, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function Settings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully");
    setTimeout(() => setSaved(false), 2000);
  };

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
        <h2 className="text-3xl font-bold tracking-tight text-gradient">System Settings</h2>
        <p className="text-muted-foreground">Manage SentinelAI configurations and preferences.</p>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="general" className="text-xs gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1.5">
            <Bell className="w-3.5 h-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Security Rules
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Display Preferences
                </CardTitle>
                <CardDescription>Customize how the dashboard looks and refreshes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider">Theme</Label>
                    <Select defaultValue="dark">
                      <SelectTrigger className="h-10 bg-background/50 border-muted-foreground/15">
                        <SelectValue placeholder="Select Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider">Dashboard Refresh Rate</Label>
                    <Select defaultValue="30s">
                      <SelectTrigger className="h-10 bg-background/50 border-muted-foreground/15">
                        <SelectValue placeholder="Select Refresh Rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10s">10 Seconds</SelectItem>
                        <SelectItem value="30s">30 Seconds</SelectItem>
                        <SelectItem value="60s">1 Minute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Dashboard Title</Label>
                  <Input defaultValue="Security Command Center" className="h-10 bg-background/50 border-muted-foreground/15" />
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave} className="h-10 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20">
                    {saved ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved!</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save Preferences</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Alert Notifications
                </CardTitle>
                <CardDescription>Configure how you receive security alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "email-alert", label: "Email notifications for High Severity alerts", defaultChecked: true },
                  { id: "sms-alert", label: "SMS notifications for Critical alerts", defaultChecked: false },
                  { id: "daily-digest", label: "Daily summary digest", defaultChecked: true },
                  { id: "push-alerts", label: "Push notifications for real-time alerts", defaultChecked: true },
                  { id: "weekly-report", label: "Weekly security report email", defaultChecked: false },
                ].map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox id={item.id} defaultChecked={item.defaultChecked} className="border-muted-foreground/30" />
                    <Label htmlFor={item.id} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {item.label}
                    </Label>
                  </motion.div>
                ))}
                <div className="pt-3">
                  <Button onClick={handleSave} className="h-10 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20">
                    {saved ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Updated!</>
                    ) : (
                      <><Bell className="w-4 h-4 mr-2" /> Update Notifications</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  AI Detection Thresholds
                </CardTitle>
                <CardDescription>Adjust the sensitivity of SentinelAI anomaly detection.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-destructive">High Risk Threshold</Label>
                    <Input type="number" defaultValue="80" className="h-10 bg-background/50 border-muted-foreground/15 font-mono" />
                    <p className="text-[10px] text-muted-foreground">Score above this triggers High risk classification</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-yellow-500">Medium Risk Threshold</Label>
                    <Input type="number" defaultValue="40" className="h-10 bg-background/50 border-muted-foreground/15 font-mono" />
                    <p className="text-[10px] text-muted-foreground">Score above this triggers Medium risk classification</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="auto-suspend" className="border-muted-foreground/30" />
                    <Label htmlFor="auto-suspend" className="text-sm cursor-pointer">
                      Automatically suspend accounts with risk score &gt; 95
                    </Label>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 ml-6">This will immediately lock accounts that exceed the critical threshold</p>
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave} className="h-10 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20">
                    {saved ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Applied!</>
                    ) : (
                      <><Shield className="w-4 h-4 mr-2" /> Apply Thresholds</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
