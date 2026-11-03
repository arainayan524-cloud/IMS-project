import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Supplier from "../models/Supplier.js";

const serverError = (res, error) => {
  console.log(error);
  return res.status(500).json({ success: false, message: "Server error" });
};

// Reads the form fields; price and stock are converted to numbers
const readFields = (body) => ({
  name: body.name?.toString().trim(),
  description: body.description?.toString().trim(),
  price: body.price === "" || body.price == null ? NaN : Number(body.price),
  stock: body.stock === "" || body.stock == null ? NaN : Number(body.stock),
  categoryId: body.categoryId,
  supplierId: body.supplierId,
});

// Returns an error message, or null when everything is fine
const validate = async (f) => {
  if (!f.name || !f.description) return "Name and description are required";
  if (Number.isNaN(f.price) || f.price < 0) return "Price must be 0 or more";
  if (!Number.isInteger(f.stock) || f.stock < 0) return "Stock must be a whole number, 0 or more";
  if (!mongoose.isValidObjectId(f.categoryId)) return "Please select a category";
  if (!mongoose.isValidObjectId(f.supplierId)) return "Please select a supplier";
  if (!(await Category.findById(f.categoryId))) return "Selected category does not exist";
  if (!(await Supplier.findById(f.supplierId))) return "Selected supplier does not exist";
  return null;
};

// One request gives the page everything it needs: products + dropdown data
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } })
      .populate("categoryId", "categoryName")
      .populate("supplierId", "name")
      .sort({ createdAt: 1 });
    const suppliers = await Supplier.find().sort({ name: 1 });
    const categories = await Category.find().sort({ categoryName: 1 });

    return res.status(200).json({ success: true, products, suppliers, categories });
  } catch (error) {
    return serverError(res, error);
  }
};

const addProduct = async (req, res) => {
  try {
    const fields = readFields(req.body);
    const problem = await validate(fields);
    if (problem) {
      return res.status(400).json({ success: false, message: problem });
    }

    const newProduct = new Product(fields);
    await newProduct.save();

    return res.status(201).json({ success: true, message: "Product added successfully" });
  } catch (error) {
    return serverError(res, error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const fields = readFields(req.body);
    const problem = await validate(fields);
    if (problem) {
      return res.status(400).json({ success: false, message: problem });
    }

    const updated = await Product.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      fields,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product updated successfully", product: updated });
  } catch (error) {
    return serverError(res, error);
  }
};

// Soft delete: only flips isDeleted, the record stays in the database
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.isDeleted) {
      return res.status(400).json({ success: false, message: "Product already deleted" });
    }

    product.isDeleted = true;
    await product.save();

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return serverError(res, error);
  }
};

export { getProducts, addProduct, updateProduct, deleteProduct };
