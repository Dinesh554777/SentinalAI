import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthLayout } from "./components/layout/AuthLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

const Login = lazy(() => import("./pages/auth/Login").then(m => ({ default: m.Login })));
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
    <div className="space-y-4 p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
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
