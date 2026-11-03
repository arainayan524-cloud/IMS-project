import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";
import {
  FaHome,
  FaTable,
  FaBoxOpen,
  FaTruck,
  FaShoppingCart,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

// Inline styles cannot use media queries, so we track screen width in state
const useIsMedium = () => {
  const [isMd, setIsMd] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const onResize = () => setIsMd(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMd;
};

const Sidebar = () => {
  const isMd = useIsMedium();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  const [hovered, setHovered] = useState(null); // inline styles cannot use :hover

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: <FaHome />, isParent: true },
    { name: "Categories", path: "/admin-dashboard/categories", icon: <FaTable />, isParent: false },
    { name: "Products", path: "/admin-dashboard/products", icon: <FaBoxOpen />, isParent: false },
    { name: "Suppliers", path: "/admin-dashboard/suppliers", icon: <FaTruck />, isParent: false },
    { name: "Orders", path: "/admin-dashboard/orders", icon: <FaShoppingCart />, isParent: false },
    { name: "Users", path: "/admin-dashboard/users", icon: <FaUsers />, isParent: false },
    { name: "Profile", path: "/admin-dashboard/profile", icon: <FaCog />, isParent: false },
  ];

  const styles = {
    sidebar: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      padding: "0.75rem",
      backgroundColor: "#000",
      color: "#fff",
      width: isMd ? "16rem" : "4rem",
      position: "fixed",
      boxSizing: "border-box",
    },
    logoBox: {
      height: "4rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: { fontSize: "1.25rem", fontWeight: "bold" },
    list: { listStyle: "none", margin: 0, padding: "0.5rem" },
    listItem: { marginBottom: "0.5rem" },
    icon: { fontSize: "1.25rem", display: "flex" },
    name: { marginLeft: "1rem", display: isMd ? "block" : "none" },
  };

  const linkStyle = (isActive, name) => ({
    display: "flex",
    alignItems: "center",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    color: "inherit",
    textDecoration: "none",
    transition: "background-color 200ms",
    backgroundColor: isActive || hovered === name ? "#374151" : "transparent",
  });

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoBox}>
        <span style={styles.logoText}>{isMd ? "Inventory MS" : "IMS"}</span>
      </div>

      <div>
        <ul style={styles.list}>
          {menuItems.map((item) => (
            <li key={item.name} style={styles.listItem}>
              <NavLink
                to={item.path}
                end={item.isParent}
                style={({ isActive }) => linkStyle(isActive, item.name)}
                onMouseEnter={() => setHovered(item.name)}
                onMouseLeave={() => setHovered(null)}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span style={styles.name}>{item.name}</span>
              </NavLink>
            </li>
          ))}
          <li style={styles.listItem}>
            <button
              type="button"
              onClick={handleLogout}
              onMouseEnter={() => setHovered("Logout")}
              onMouseLeave={() => setHovered(null)}
              style={{ ...linkStyle(false, "Logout"), width: "100%", border: "none", background: hovered === "Logout" ? "#374151" : "transparent", cursor: "pointer", font: "inherit" }}
            >
              <span style={styles.icon}><FaSignOutAlt /></span>
              <span style={styles.name}>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
