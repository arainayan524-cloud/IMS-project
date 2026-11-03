import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";

const API_URL = "http://localhost:5000/api/supplier";

const emptyForm = { name: "", email: "", number: "", address: "" };

// Token saved at login time (see authcontext.jsx)
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
});

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); // add / edit popup
  const [editingSupplier, setEditingSupplier] = useState(null); // id of the supplier being edited
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

  // Used after add / edit / delete to refresh the table
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(API_URL, authHeaders());
      if (response.data.success) {
        setSuppliers(response.data.suppliers);
      }
    } catch (error) {
      handleError(error, "Error fetching suppliers");
    }
  };

  // First load when the page opens
  useEffect(() => {
    (async () => {
      await fetchSuppliers();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormData(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier._id);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      number: supplier.number,
      address: supplier.address,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = editingSupplier
        ? await axios.put(`${API_URL}/${editingSupplier}`, formData, authHeaders())
        : await axios.post(`${API_URL}/add`, formData, authHeaders());

      if (response.data.success) {
        alert(response.data.message);
        closeModal();
        fetchSuppliers();
      }
    } catch (error) {
      handleError(
        error,
        editingSupplier
          ? "Error updating supplier. Please try again."
          : "Error adding supplier. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this supplier?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/${id}`, authHeaders());
      if (response.data.success) {
        alert(response.data.message);
        fetchSuppliers();
      }
    } catch (error) {
      handleError(error, "Error deleting supplier. Please try again.");
    }
  };

  // Search by name, email, phone number or address
  const term = searchTerm.trim().toLowerCase();
  const filteredSuppliers = suppliers.filter((supplier) =>
    [supplier.name, supplier.email, supplier.number, supplier.address].some((value) =>
      value.toLowerCase().includes(term)
    )
  );

  if (loading) return <div className="p-4">Loading...</div>;

  const inputClass = "w-full rounded-md border border-gray-500 px-3 py-2";

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">Supplier Management</h1>

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
          Add Supplier
        </button>
      </div>

      {/* Suppliers table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">S NO</th>
              <th className="border border-gray-300 p-2">Supplier Name</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Phone Number</th>
              <th className="border border-gray-300 p-2">Address</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="border border-gray-300 p-4 text-center text-gray-500">
                  No suppliers found
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier, index) => (
                <tr key={supplier._id}>
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{supplier.name}</td>
                  <td className="border border-gray-300 p-2">{supplier.email}</td>
                  <td className="border border-gray-300 p-2">{supplier.number}</td>
                  <td className="border border-gray-300 p-2">{supplier.address}</td>
                  <td className="border border-gray-300 p-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="mr-2 cursor-pointer rounded-md bg-[#eab308] px-3 py-1 text-white hover:bg-[#ca8a04]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(supplier._id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
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
                placeholder="Supplier Name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Supplier Email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <input
                type="tel"
                name="number"
                placeholder="Supplier Phone Number"
                value={formData.number}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Supplier Address"
                value={formData.address}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full cursor-pointer rounded-md bg-[#22c55e] py-2 font-medium text-white hover:bg-[#16a34a] disabled:opacity-70"
                >
                  {saving ? "Please wait..." : editingSupplier ? "Save Changes" : "Add Supplier"}
                </button>

                {editingSupplier && (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full cursor-pointer rounded-md bg-[#ef4444] py-2 font-medium text-white hover:bg-[#dc2626]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
