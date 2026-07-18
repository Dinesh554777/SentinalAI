import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthLayout } from "./components/layout/AuthLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

const Login = lazy(() => import("./pages/auth/Login").then(m => ({ default: m.Login })));
const Signup = lazy(() => import("./pages/auth/Signup").then(m => ({ default: m.Signup })));
const OTP = lazy(() => import("./pages/auth/OTP").then(m => ({ default: m.OTP })));
const AccessDenied = lazy(() => import("./pages/auth/AccessDenied").then(m => ({ default: m.AccessDenied })));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const LiveMonitoring = lazy(() => import("./pages/live-monitoring/LiveMonitoring").then(m => ({ default: m.LiveMonitoring })));
const RiskAnalysis = lazy(() => import("./pages/risk-analysis/RiskAnalysis").then(m => ({ default: m.RiskAnalysis })));
const Alerts = lazy(() => import("./pages/alerts/Alerts").then(m => ({ default: m.Alerts })));
const Users = lazy(() => import("./pages/users/Users").then(m => ({ default: m.Users })));
const UserDetails = lazy(() => import("./pages/users/UserDetails").then(m => ({ default: m.UserDetails })));
const Reports = lazy(() => import("./pages/reports/Reports").then(m => ({ default: m.Reports })));
const Profile = lazy(() => import("./pages/profile/Profile").then(m => ({ default: m.Profile })));
const Settings = lazy(() => import("./pages/settings/Settings").then(m => ({ default: m.Settings })));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-glow-pulse" />
          <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/20 animate-pulse">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-foreground">Loading SentinelAI</p>
          <p className="text-xs text-muted-foreground">Initializing security modules...</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/otp" element={<OTP />} />
              <Route path="/access-denied" element={<AccessDenied />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/live-monitoring" element={<LiveMonitoring />} />
                <Route path="/risk-analysis" element={<RiskAnalysis />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetails />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
