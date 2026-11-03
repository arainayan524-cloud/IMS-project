import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const useIsMedium = () => {
  const [isMd, setIsMd] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const onResize = () => setIsMd(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMd;
};

const Dashboard = () => {
  const isMd = useIsMedium();

  const styles = {
    wrapper: { display: "flex" },
    content: {
      flex: 1,
      marginLeft: isMd ? "16rem" : "4rem",
      backgroundColor: "#f3f4f6",
      minHeight: "100vh",
    },
  };

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
