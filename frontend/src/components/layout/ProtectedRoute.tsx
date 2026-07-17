import { Navigate, Outlet } from "react-router-dom";

function isTokenValid(): boolean {
  const token = localStorage.getItem("sentinel_token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  } catch {
    return false;
  }
}

export function ProtectedRoute() {
  if (!isTokenValid()) {
    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_role");
    localStorage.removeItem("sentinel_user_id");
    localStorage.removeItem("sentinel_user_name");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
