import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "admin" | "developer")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    // If a student tries to access admin, or admin tries to access developer
    // Redirect them to their appropriate home
    if (user.role === "student") return <Navigate to="/student-profile" replace />;
    if (user.role === "admin") return <Navigate to="/recruiter-dashboard" replace />;
    if (user.role === "developer") return <Navigate to="/developer-dashboard" replace />;
    
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
