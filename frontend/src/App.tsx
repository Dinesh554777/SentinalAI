import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthLayout } from "./components/layout/AuthLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { OTP } from "./pages/auth/OTP";
import { AccessDenied } from "./pages/auth/AccessDenied";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { LiveMonitoring } from "./pages/live-monitoring/LiveMonitoring";
import { RiskAnalysis } from "./pages/risk-analysis/RiskAnalysis";
import { Alerts } from "./pages/alerts/Alerts";
import { Users } from "./pages/users/Users";
import { UserDetails } from "./pages/users/UserDetails";
import { Reports } from "./pages/reports/Reports";
import { Profile } from "./pages/profile/Profile";
import { Settings } from "./pages/settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/access-denied" element={<AccessDenied />} />
        </Route>

        {/* Dashboard Routes (Protected) */}
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
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
