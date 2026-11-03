import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";

const API_URL = "http://localhost:5000/api/category";

// Token saved at login time (see authcontext.jsx)
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
});

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState(null); // id of the category being edited
  const { logout } = useAuth();
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

  // Used after add / edit / delete to refresh the table
  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_URL, authHeaders());
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      handleError(error, "Error fetching categories");
    }
  };

  // First load when the page opens
  useEffect(() => {
    (async () => {
      await fetchCategories();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = { categoryName, categoryDescription };
      const response = editingCategory
        ? await axios.put(`${API_URL}/${editingCategory}`, data, authHeaders())
        : await axios.post(`${API_URL}/add`, data, authHeaders());

      if (response.data.success) {
        alert(response.data.message);
        resetForm();
        fetchCategories();
      }
    } catch (error) {
      handleError(
        error,
        editingCategory
          ? "Error updating category. Please try again."
          : "Error adding category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category._id);
    setCategoryName(category.categoryName);
    setCategoryDescription(category.categoryDescription);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/${id}`, authHeaders());
      if (response.data.success) {
        alert(response.data.message);
        if (editingCategory === id) resetForm();
        fetchCategories();
      }
    } catch (error) {
      handleError(error, "Error deleting category. Please try again.");
    }
  };

  // Search categories by name
  const term = searchTerm.trim().toLowerCase();
  const filteredCategories = categories.filter((category) =>
    category.categoryName.toLowerCase().includes(term)
  );

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">Category Management</h1>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left: add / edit form */}
        <div className="lg:w-1/3">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <h2 className="mb-4 text-center text-xl font-bold">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full rounded-md border-2 border-gray-500 px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Category Description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className="w-full rounded-md border-2 border-gray-500 px-3 py-2"
                required
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full cursor-pointer rounded-md bg-[#22c55e] py-2 font-medium text-white hover:bg-[#16a34a] disabled:opacity-70"
                >
                  {saving ? "Please wait..." : editingCategory ? "Save Changes" : "Add Category"}
                </button>

                {editingCategory && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full cursor-pointer rounded-md bg-[#ef4444] py-2 font-medium text-white hover:bg-[#dc2626]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: categories table */}
        <div className="lg:w-2/3">
          <div className="overflow-x-auto rounded-lg bg-white p-4 shadow-md">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 w-full rounded-md border-2 border-gray-400 px-3 py-2"
            />
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="w-24 border border-gray-200 p-2">S No</th>
                  <th className="border border-gray-200 p-2">Category Name</th>
                  <th className="border border-gray-200 p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="border border-gray-200 p-4 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category, index) => (
                    <tr key={category._id}>
                      <td className="border border-gray-200 p-2">{index + 1}</td>
                      <td className="border border-gray-200 p-2">{category.categoryName}</td>
                      <td className="border border-gray-200 p-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="mr-2 cursor-pointer rounded-md bg-[#3b82f6] px-3 py-1 text-white hover:bg-[#2563eb]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="cursor-pointer rounded-md bg-[#ef4444] px-3 py-1 text-white hover:bg-[#dc2626]"
                        >
                          Delete
                        </button>
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

export default Categories;
