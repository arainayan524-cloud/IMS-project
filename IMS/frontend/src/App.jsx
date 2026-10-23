import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Root from "./utils/Root";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Categories from "./components/Categories";
import Suppliers from "./components/Suppliers";
import Products from "./components/Products";

const ADMIN = ["admin"];
const CUSTOMER = ["customer"];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />

        {/* Parent route: renders Sidebar + <Outlet /> */}
        <Route path="/admin-dashboard" element={
            <ProtectedRoutes requireRole={ADMIN}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          {/* index = default child when visiting /admin-dashboard */}
          <Route index element={<h1>Summary of dashboard</h1>} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="orders" element={<h1>Orders</h1>} />
          <Route path="users" element={<h1>Users</h1>} />
          <Route path="profile" element={<h1>Profile</h1>} />
        </Route>

        <Route path="/customer-dashboard" element={
            <ProtectedRoutes requireRole={CUSTOMER}>
              <h1>Customer dashboard</h1>
            </ProtectedRoutes>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<p style={{ fontWeight: "bold", fontSize: "1.875rem", marginTop: "5rem", marginLeft: "5rem" }}>Unauthorized</p>} />
      </Routes>
    </Router>
  );
}

export default App;
