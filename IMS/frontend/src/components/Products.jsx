import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";

const API_URL = "http://localhost:5000/api/product";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  supplierId: "",
};

// Token saved at login time (see authcontext.jsx)
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
});

// 0 = red, 1 to 5 = yellow (low), more than 5 = green
const stockBadge = (stock) => {
  if (stock === 0) return "bg-red-100 text-red-700";
  if (stock <= 5) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); // add / edit popup
  const [editingProduct, setEditingProduct] = useState(null); // id of the product being edited
  const [formData, setFormData] = useState(emptyForm);
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

  // One request returns products, categories and suppliers
  const fetchProducts = async () => {
    try {
      const response = await axios.get(API_URL, authHeaders());
      if (response.data.success) {
        setProducts(response.data.products);
        setCategories(response.data.categories);
        setSuppliers(response.data.suppliers);
      }
    } catch (error) {
      handleError(error, "Error fetching products");
    }
  };

  // First load when the page opens
  useEffect(() => {
    (async () => {
      await fetchProducts();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId?._id || "",
      supplierId: product.supplierId?._id || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = editingProduct
        ? await axios.put(`${API_URL}/${editingProduct}`, formData, authHeaders())
        : await axios.post(`${API_URL}/add`, formData, authHeaders());

      if (response.data.success) {
        alert(response.data.message);
        closeModal();
        fetchProducts();
      }
    } catch (error) {
      handleError(
        error,
        editingProduct
          ? "Error updating product. Please try again."
          : "Error adding product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/${id}`, authHeaders());
      if (response.data.success) {
        alert(response.data.message);
        fetchProducts();
      }
    } catch (error) {
      handleError(error, "Error deleting product. Please try again.");
    }
  };

  // Search by product name, category name or supplier name
  const term = searchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    [product.name, product.categoryId?.categoryName, product.supplierId?.name].some((value) =>
      (value || "").toLowerCase().includes(term)
    )
  );

  if (loading) return <div className="p-4">Loading...</div>;

  const inputClass = "w-full rounded-md border border-gray-500 px-3 py-2";

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">Product Management</h1>

      {/* Search + Add button */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xs rounded-md border-2 border-gray-400 px-3 py-2"
        />
        <button
          onClick={openAddModal}
          className="cursor-pointer rounded-md bg-[#2563eb] px-4 py-2 text-white hover:bg-[#1d4ed8]"
        >
          Add Product
        </button>
      </div>

      {/* Products table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">S NO</th>
              <th className="border border-gray-300 p-2">Product Name</th>
              <th className="border border-gray-300 p-2">Category Name</th>
              <th className="border border-gray-300 p-2">Supplier Name</th>
              <th className="border border-gray-300 p-2">Price</th>
              <th className="border border-gray-300 p-2">Stock</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="border border-gray-300 p-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr key={product._id}>
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{product.name}</td>
                  <td className="border border-gray-300 p-2">
                    {product.categoryId?.categoryName || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">{product.supplierId?.name || "-"}</td>
                  <td className="border border-gray-300 p-2">{product.price}</td>
                  <td className="border border-gray-300 p-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${stockBadge(product.stock)}`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(product)}
                      className="mr-2 cursor-pointer rounded-md bg-[#eab308] px-3 py-1 text-white hover:bg-[#ca8a04]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="cursor-pointer rounded-md bg-[#dc2626] px-3 py-1 text-white hover:bg-[#b91c1c]"
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

      {/* Add / Edit popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-4 right-4 cursor-pointer text-lg font-bold"
            >
              X
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Enter Price"
                min="0"
                step="any"
                value={formData.price}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <input
                type="number"
                name="stock"
                placeholder="Enter Stock"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>

              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full cursor-pointer rounded-md bg-[#22c55e] py-2 font-medium text-white hover:bg-[#16a34a] disabled:opacity-70"
                >
                  {saving ? "Please wait..." : editingProduct ? "Save Changes" : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full cursor-pointer rounded-md bg-[#ef4444] py-2 font-medium text-white hover:bg-[#dc2626]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
