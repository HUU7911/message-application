import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { token, loading, isAdmin } = useAuth();
  if (loading) return <div className="center muted">Đang tải…</div>;
  if (!token) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
