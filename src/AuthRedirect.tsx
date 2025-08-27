import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosInstance, { clearAllAppData } from "./api/axioConfig";

// Loading Spinner Component
const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative">
        {/* Main spinner */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* Optional: Add a pulsing effect around the spinner */}
        <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse opacity-50"></div>
        
        {/* Optional: Add dots animation */}
        <div className="flex justify-center mt-6 space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

const AuthRedirect = () => {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const userDataString = localStorage.getItem("userData");
      const selectedRole = localStorage.getItem("selectedRole"); // stored in lowercase

      try {
        // Add a minimum loading time to prevent flash
        const startTime = Date.now();
        const minLoadingTime = 800; // 800ms minimum loading time

        // Make request to /protected regardless of localStorage state
        const response = await axiosInstance.get("/protected");

        // If token expired or missing, backend responds accordingly
        const data = response.data;

        if (data.msg === "Token has expired" || data.msg === "Missing Authorization Header") {
          // Token invalid or missing -> clear all data and redirect to index
          clearAllAppData();
          setRedirectPath("/index");
          return;
        }

        // Token valid
        if (!userDataString || !selectedRole) {
          // Clear potentially corrupted data
          clearAllAppData();
          setRedirectPath("/index");
          return;
        }

        const userData = JSON.parse(userDataString);
        const roles = userData.roles?.map((r: { name: string }) => r.name.toLowerCase()) || [];

        // Ensure the user actually has the role stored in localStorage
        if (!roles.includes(selectedRole)) {
          // Clear data and redirect to login if role mismatch
          clearAllAppData();
          setRedirectPath("/index");
          return;
        }

        // Redirect according to the stored role
        switch (selectedRole) {
          case "admin":
            setRedirectPath("/admin");
            break;
          case "doctor":
            setRedirectPath("/doctor");
            break;
          case "patient":
            setRedirectPath("/patient");
            break;
          case "comptable":
            setRedirectPath("/accountant");
            break;
          default:
            clearAllAppData();
            setRedirectPath("/login");
        }

        // Ensure minimum loading time has passed for better UX
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

      } catch (err: any) {
        console.error("Error checking auth:", err);
        // Clear all data on error
        clearAllAppData();
        setRedirectPath("/index");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <LoadingSpinner />;

  return <Navigate to={redirectPath || "/index"} replace />;
};

export default AuthRedirect;