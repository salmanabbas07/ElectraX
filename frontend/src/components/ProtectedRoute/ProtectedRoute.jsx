import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "120px 0", textAlign: "center" }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
