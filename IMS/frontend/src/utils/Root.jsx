import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../context/useAuth.js";

const Root = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate("/login", { replace: true });
    if (user.role === "admin") return navigate("/admin-dashboard", { replace: true });
    if (user.role === "customer") return navigate("/customer-dashboard", { replace: true });
    navigate("/login", { replace: true });
  }, [user, navigate]);

  return null;
};

export default Root;
