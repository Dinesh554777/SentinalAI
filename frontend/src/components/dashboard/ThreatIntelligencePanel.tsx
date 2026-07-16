import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Crosshair, Clock, Globe } from "lucide-react";
import type { ThreatIntelligence } from "@/types";
import { motion } from "framer-motion";

interface Props {
  threats: ThreatIntelligence[];
}

export function ThreatIntelligencePanel({ threats }: Props) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="h-full backdrop-blur-md bg-background/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Threat Intelligence Feed
        </CardTitle>
        <CardDescription>Latest active campaigns and intercepted techniques</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {threats.map((threat, idx) => (
            <motion.div 
              key={threat.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="mt-1">
                <ShieldAlert className={`w-5 h-5 ${threat.severity === 'Critical' || threat.severity === 'High' ? 'text-destructive' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{threat.type}</p>
                  <Badge variant="outline" className={getSeverityColor(threat.severity)}>{threat.severity}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1 font-mono bg-muted px-1.5 rounded"><Crosshair className="w-3 h-3" /> {threat.mitreTechnique}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(threat.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="text-xs pt-1">
                  Target: <span className="font-medium text-foreground">{threat.affectedUser}</span> | Status: <span className="text-primary">{threat.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
