import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";

const ProtectedRoutes = ({ children, requireRole = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const allowed = !!user && requireRole.includes(user.role);

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
    else if (!allowed) navigate("/unauthorized", { replace: true });
  }, [user, allowed, navigate]);

  return allowed ? children : null;
};

export default ProtectedRoutes;
