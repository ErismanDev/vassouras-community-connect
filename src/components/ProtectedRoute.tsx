
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [roleVerified, setRoleVerified] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Check role from auth.users metadata (avoiding RLS policies with infinite recursion)
  useEffect(() => {
    const verifyUserRole = async () => {
      if (!isAuthenticated || !user) {
        setRoleVerified(false);
        setIsVerifying(false);
        return;
      }

      // If no specific roles are required, or if we don't need to check roles
      if (!allowedRoles || allowedRoles.length === 0) {
        setRoleVerified(true);
        setIsVerifying(false);
        return;
      }

      try {
        // Use user.role from AuthContext that was already loaded from user metadata
        const hasAllowedRole = allowedRoles.includes(user.role);
        setRoleVerified(hasAllowedRole);
      } catch (error) {
        console.error("Error verifying user role:", error);
        setRoleVerified(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyUserRole();
  }, [isAuthenticated, user, allowedRoles]);

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-association-primary" />
        <span className="ml-2 text-lg font-medium">Carregando...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && roleVerified === false) {
    // Redirect to unauthorized if user doesn't have required role
    return <Navigate to="/unauthorized" replace />;
  }

  // If there are children, render them, otherwise render the Outlet
  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
