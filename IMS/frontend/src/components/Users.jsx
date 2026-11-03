import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";

const API_URL = "http://localhost:5000/api/users";

const emptyForm = { name: "", email: "", password: "", address: "", role: "" };

// Token saved at login time (see authcontext.jsx)
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
});

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Expired token -> go back to login, otherwise show the server message
  const handleError = (error, fallback) => {
    if (error.response?.status === 401) {
      logout();
      navigate("/login", { replace: true });
      return;
    }
    alert(error.response?.data?.message || fallback);
  };

  // Used after add / delete to refresh the table
  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL, authHeaders());
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      handleError(error, "Error fetching users");
    }
  };

  // First load when the page opens
  useEffect(() => {
    (async () => {
      await fetchUsers();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.post(`${API_URL}/add`, formData, authHeaders());
      if (response.data.success) {
        alert(response.data.message);
        setFormData(emptyForm);
        fetchUsers();
      }
    } catch (error) {
      handleError(error, "Error adding user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/${id}`, authHeaders());
      if (response.data.success) {
        alert(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      handleError(error, "Error deleting user. Please try again.");
    }
  };

  // Search by name, email, address or role
  const term = searchTerm.trim().toLowerCase();
  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.address, user.role].some((value) =>
      (value || "").toLowerCase().includes(term)
    )
  );

  if (loading) return <div className="p-4">Loading...</div>;

  const inputClass = "w-full rounded-md border border-gray-600 px-3 py-2";

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left: add user form */}
        <div className="lg:w-1/3">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <h2 className="mb-4 text-center text-xl font-bold">Add User</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="off"
                className={inputClass}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                className={inputClass}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={inputClass}
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                autoComplete="off"
                className={inputClass}
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>

              <button
                type="submit"
                disabled={saving}
                className="w-full cursor-pointer rounded-md bg-[#22c55e] py-2 font-medium text-white hover:bg-[#16a34a] disabled:opacity-70"
              >
                {saving ? "Please wait..." : "Add User"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: search + users table */}
        <div className="lg:w-2/3">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 w-full rounded-md border-2 border-gray-500 bg-white px-3 py-2"
          />

          <div className="overflow-x-auto rounded-lg bg-white p-4 shadow-md">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-2 whitespace-nowrap">S No</th>
                  <th className="border border-gray-200 p-2">Name</th>
                  <th className="border border-gray-200 p-2">Email</th>
                  <th className="border border-gray-200 p-2">Address</th>
                  <th className="border border-gray-200 p-2">Role</th>
                  <th className="border border-gray-200 p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="border border-gray-200 p-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td className="border border-gray-200 p-2">{index + 1}</td>
                      <td className="border border-gray-200 p-2">{user.name}</td>
                      <td className="border border-gray-200 p-2">{user.email}</td>
                      <td className="border border-gray-200 p-2">{user.address}</td>
                      <td className="border border-gray-200 p-2">{user.role}</td>
                      <td className="border border-gray-200 p-2 whitespace-nowrap">
                        {user._id === currentUser?.id ? (
                          <span className="text-sm text-gray-500">You</span>
                        ) : (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="cursor-pointer rounded-md bg-[#ef4444] px-3 py-1 text-white hover:bg-[#dc2626]"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
