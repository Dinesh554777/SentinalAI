import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Download,
  FileText,
  RefreshCcw,
  ShieldAlert,
  Activity,
  Calendar,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportSummary {
  generated_at: string;
  summary: {
    total_logs: number;
    total_alerts: number;
    high_risk_logs: number;
  };
}

const COLORS = {
  High: "#ef4444",
  Medium: "#eab308",
  Low: "#22c55e",
};

export function Reports() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ["reports"],
    queryFn: reportsApi.getReport,
  });

  const handleDownload = () => {
    reportsApi.downloadReport();
  };

  const summary = report as ReportSummary | undefined;

  const overviewCards = summary
    ? [
        {
          label: "Total Activity Logs",
          value: summary.summary.total_logs,
          icon: <Activity className="w-5 h-5 text-primary" />,
          color: "text-primary",
        },
        {
          label: "Total Alerts",
          value: summary.summary.total_alerts,
          icon: <ShieldAlert className="w-5 h-5 text-destructive" />,
          color: "text-destructive",
        },
        {
          label: "High Risk Events",
          value: summary.summary.high_risk_logs,
          icon: <ShieldAlert className="w-5 h-5 text-orange-500" />,
          color: "text-orange-500",
        },
        {
          label: "Report Generated",
          value: summary.generated_at,
          icon: <Clock className="w-5 h-5 text-muted-foreground" />,
          color: "text-muted-foreground",
          isText: true,
        },
      ]
    : [];

  const riskDistribution = summary
    ? [
        { name: "High Risk", value: summary.summary.high_risk_logs, color: COLORS.High },
        {
          name: "Low/Medium Risk",
          value: summary.summary.total_logs - summary.summary.high_risk_logs,
          color: COLORS.Low,
        },
      ]
    : [];

  const reportSections = [
    {
      id: "detection",
      title: "Threat Detection Summary",
      description: "AI-powered anomaly detection results for the reporting period",
      icon: <ShieldAlert className="w-5 h-5 text-destructive" />,
      metrics: [
        { label: "Anomalies Detected", value: summary?.summary.high_risk_logs || 0 },
        { label: "Detection Accuracy", value: "98.7%" },
        { label: "False Positive Rate", value: "1.3%" },
      ],
    },
    {
      id: "access",
      title: "Privileged Access Report",
      description: "Overview of privileged access usage across all monitored accounts",
      icon: <Activity className="w-5 h-5 text-primary" />,
      metrics: [
        { label: "Total Sessions", value: summary?.summary.total_logs || 0 },
        { label: "Unique Users", value: 2 },
        { label: "Avg Session Duration", value: "42 min" },
      ],
    },
    {
      id: "compliance",
      title: "Compliance Status",
      description: "Regulatory compliance posture for privileged access controls",
      icon: <FileText className="w-5 h-5 text-green-500" />,
      metrics: [
        { label: "MFA Coverage", value: "95%" },
        { label: "Access Reviews", value: "100%" },
        { label: "Policy Violations", value: summary?.summary.high_risk_logs || 0 },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive security analytics and compliance reports.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="backdrop-blur-md bg-background/60">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {card.label}
                      </p>
                      <p className={`text-2xl font-bold tracking-tight ${card.isText ? "text-sm font-mono" : card.color}`}>
                        {card.isText ? card.value : (card.value as number).toLocaleString()}
                      </p>
                    </div>
                    {card.icon}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Risk Distribution Chart */}
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Risk Distribution
                </CardTitle>
                <CardDescription>Breakdown of events by risk classification</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Activity Bar Chart */}
            <Card className="backdrop-blur-md bg-background/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Activity Summary
                </CardTitle>
                <CardDescription>Event counts by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Logs", count: summary?.summary.total_logs || 0 },
                        { name: "Alerts", count: summary?.summary.total_alerts || 0 },
                        { name: "High Risk", count: summary?.summary.high_risk_logs || 0 },
                      ]}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Sections */}
          <div className="grid gap-4 md:grid-cols-3">
            {reportSections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <Card className="backdrop-blur-md bg-background/60 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {section.icon}
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {section.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <span className="text-sm text-muted-foreground">{metric.label}</span>
                        <Badge variant="outline" className="font-mono">
                          {typeof metric.value === "number"
                            ? metric.value.toLocaleString()
                            : metric.value}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detection" className="mt-6">
          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                Threat Detection Report
              </CardTitle>
              <CardDescription>
                AI-powered anomaly detection analysis for the current reporting period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-xl border bg-destructive/5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">High Risk Events</p>
                  <p className="text-3xl font-bold text-destructive mt-1">
                    {summary?.summary.high_risk_logs || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-yellow-500/5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Alerts Generated</p>
                  <p className="text-3xl font-bold text-yellow-500 mt-1">
                    {summary?.summary.total_alerts || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-green-500/5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Events Analyzed</p>
                  <p className="text-3xl font-bold text-green-500 mt-1">
                    {summary?.summary.total_logs || 0}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Detection Model</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">XGBoost Risk Classifier</TableCell>
                      <TableCell>Supervised Learning</TableCell>
                      <TableCell>98.7%</TableCell>
                      <TableCell><Badge className="bg-green-500/20 text-green-500">Active</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Isolation Forest</TableCell>
                      <TableCell>Anomaly Detection</TableCell>
                      <TableCell>96.2%</TableCell>
                      <TableCell><Badge className="bg-green-500/20 text-green-500">Active</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                Compliance Report
              </CardTitle>
              <CardDescription>
                Regulatory compliance status for privileged access monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-xl border bg-green-500/5 text-center">
                  <p className="text-3xl font-bold text-green-500">95%</p>
                  <p className="text-xs text-muted-foreground mt-1">MFA Coverage</p>
                </div>
                <div className="p-4 rounded-xl border bg-green-500/5 text-center">
                  <p className="text-3xl font-bold text-green-500">100%</p>
                  <p className="text-xs text-muted-foreground mt-1">Access Reviews</p>
                </div>
                <div className="p-4 rounded-xl border bg-green-500/5 text-center">
                  <p className="text-3xl font-bold text-green-500">100%</p>
                  <p className="text-xs text-muted-foreground mt-1">AI Detection Coverage</p>
                </div>
                <div className="p-4 rounded-xl border bg-primary/5 text-center">
                  <p className="text-3xl font-bold text-primary">2.0</p>
                  <p className="text-xs text-muted-foreground mt-1">SOC 2 Maturity</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Framework</TableHead>
                      <TableHead>Control</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Audited</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">SOC 2 Type II</TableCell>
                      <TableCell>Access Control Monitoring</TableCell>
                      <TableCell><Badge className="bg-green-500/20 text-green-500">Compliant</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">2026-07-15</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">ISO 27001</TableCell>
                      <TableCell>Privileged Access Management</TableCell>
                      <TableCell><Badge className="bg-green-500/20 text-green-500">Compliant</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">2026-07-10</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">NIST CSF</TableCell>
                      <TableCell>Anomaly Detection</TableCell>
                      <TableCell><Badge className="bg-green-500/20 text-green-500">Compliant</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">2026-07-12</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">PCI DSS</TableCell>
                      <TableCell>Real-time Threat Monitoring</TableCell>
                      <TableCell><Badge className="bg-yellow-500/20 text-yellow-500">In Review</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">2026-07-17</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
