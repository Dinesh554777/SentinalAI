import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Crosshair, Clock, Globe, ExternalLink } from "lucide-react";
import type { ThreatIntelligence } from "@/types";
import { motion } from "framer-motion";

interface Props {
  threats: ThreatIntelligence[];
}

export function ThreatIntelligencePanel({ threats }: Props) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive text-destructive-foreground shadow-destructive/20';
      case 'High': return 'bg-orange-500 text-white shadow-orange-500/20';
      case 'Medium': return 'bg-yellow-500 text-white shadow-yellow-500/20';
      case 'Low': return 'bg-green-500 text-white shadow-green-500/20';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-destructive';
      case 'Investigating': return 'text-yellow-500';
      case 'Mitigated': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="h-full backdrop-blur-md bg-background/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="w-4 h-4 text-primary" />
          Threat Intelligence Feed
        </CardTitle>
        <CardDescription>Latest active campaigns and intercepted techniques</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {threats.map((threat, idx) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              whileHover={{ x: 2 }}
              className="flex items-start gap-3 p-3 rounded-xl border bg-card/50 hover:bg-muted/50 transition-all duration-200 cursor-default group"
            >
              <div className={`mt-0.5 p-1.5 rounded-lg ${
                threat.severity === 'Critical' || threat.severity === 'High'
                  ? 'bg-destructive/10'
                  : 'bg-muted'
              }`}>
                <ShieldAlert className={`w-4 h-4 ${
                  threat.severity === 'Critical' || threat.severity === 'High'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`} />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">{threat.type}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0 shadow-sm ${getSeverityColor(threat.severity)}`}
                  >
                    {threat.severity}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                    <Crosshair className="w-3 h-3" />
                    {threat.mitreTechnique}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(threat.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="text-xs">
                  Target: <span className="font-medium text-foreground">{threat.affectedUser}</span>
                  <span className="mx-1.5 text-muted-foreground">|</span>
                  Status: <span className={`font-medium ${getStatusColor(threat.status)}`}>{threat.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
