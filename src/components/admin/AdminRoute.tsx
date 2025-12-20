import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "sub-admin";
}

export const AdminRoute = ({ children, requiredRole }: AdminRouteProps) => {
  const session = localStorage.getItem("admin_session");
  
  if (!session) {
    return <Navigate to="/admin" replace />;
  }

  try {
    const sessionData = JSON.parse(session);
    
    // Check if session is expired (24 hours)
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLogin > 24) {
      localStorage.removeItem("admin_session");
      return <Navigate to="/admin" replace />;
    }

    // Check role if required
    if (requiredRole && sessionData.role !== requiredRole) {
      return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    localStorage.removeItem("admin_session");
    return <Navigate to="/admin" replace />;
  }
};


