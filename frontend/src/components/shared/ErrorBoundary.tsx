import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <Card className="w-full max-w-md border-destructive/20 shadow-xl shadow-destructive/5">
            <CardHeader className="text-center pb-2">
              <div className="relative mx-auto mb-4">
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
                <div className="relative p-4 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-2xl ring-1 ring-destructive/20 mx-auto w-fit">
                  <AlertTriangle className="w-10 h-10 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl text-destructive">Something went wrong</CardTitle>
              <CardDescription className="text-sm">
                An unexpected error occurred while rendering this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-xs font-mono text-destructive/80 overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
              <Button
                onClick={this.handleReset}
                className="w-full h-10 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
