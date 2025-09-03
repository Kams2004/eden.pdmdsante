
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const userDataString = localStorage.getItem('userData');

  if (!userDataString) {
    return <Navigate to="/login" replace />;
  }

  let userData;
  try {
    userData = JSON.parse(userDataString);
  } catch (error) {

    return <Navigate to="/login" replace />;
  }

  const userRoles = userData.roles?.map((role: { name: string }) => role.name.toLowerCase()) || [];
  const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
