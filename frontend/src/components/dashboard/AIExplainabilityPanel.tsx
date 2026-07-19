import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Target, ShieldAlert, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RiskAnalysis } from "@/types";
import { motion } from "framer-motion";

interface Props {
  analysis: RiskAnalysis;
}

export function AIExplainabilityPanel({ analysis }: Props) {
  const { toast } = useToast();
  const getPredictionColor = (pred: string) => {
    switch (pred) {
      case 'High': return 'text-destructive';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPredictionBg = (pred: string) => {
    switch (pred) {
      case 'High': return 'bg-destructive/10 border-destructive/20';
      case 'Medium': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="h-full flex flex-col backdrop-blur-md bg-background/60 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
          AI Engine Verdict
        </CardTitle>
        <CardDescription>Deep learning evaluation and recommended playbook</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div className="flex justify-between items-start p-4 rounded-xl border bg-muted/20">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Subject Analysis</h3>
            <p className="text-xl font-bold font-mono mt-1">{analysis.userId}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Prediction</h3>
            <p className={`text-2xl font-bold uppercase tracking-widest ${getPredictionColor(analysis.prediction)}`}>
              {analysis.prediction}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> AI Confidence Level
            </span>
            <span className="text-sm font-medium">{analysis.confidence.toFixed(1)}%</span>
          </div>
          <Progress value={analysis.confidence} className="h-2" />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" /> Feature Importance (Why)
          </h4>
          <div className="space-y-2">
            {analysis.topFactors?.map((factor, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="flex justify-between text-xs mb-1">
                  <span>{factor.feature}</span>
                  <span className="text-muted-foreground">+{factor.impact}% Risk</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/70" style={{ width: `${factor.impact}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">{factor.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t mt-auto">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
            <ShieldAlert className="h-4 w-4" /> Recommended Playbook
          </h4>
          <div className={`p-4 rounded-lg border ${getPredictionBg(analysis.prediction)}`}>
            <p className="text-sm font-medium leading-relaxed mb-4">{analysis.recommendedAction}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="w-full"
                onClick={() => toast({ title: "Playbook Executed", description: `Automated response playbook for ${analysis.userId} has been triggered.` })}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Execute Playbook
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => toast({ title: "Manual Review", description: `Case for ${analysis.userId} opened for manual analyst review.` })}
              >
                Manual Review <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
