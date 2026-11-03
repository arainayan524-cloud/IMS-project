import mongoose from "mongoose";
import Category from "../models/Category.js";

const serverError = (res, error) => {
  console.log(error);
  return res.status(500).json({ success: false, message: "Server error" });
};

const addCategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryName?.trim();
    const categoryDescription = req.body.categoryDescription?.trim();

    if (!categoryName || !categoryDescription) {
      return res
        .status(400)
        .json({ success: false, message: "Category name and description are required" });
    }

    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }

    const newCategory = new Category({ categoryName, categoryDescription });
    await newCategory.save();

    return res
      .status(201)
      .json({ success: true, message: "Category added successfully" });
  } catch (error) {
    return serverError(res, error);
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return serverError(res, error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const categoryName = req.body.categoryName?.trim();
    const categoryDescription = req.body.categoryDescription?.trim();
    if (!categoryName || !categoryDescription) {
      return res
        .status(400)
        .json({ success: false, message: "Category name and description are required" });
    }

    // Another category must not already use this name
    const duplicate = await Category.findOne({ categoryName, _id: { $ne: id } });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { categoryName, categoryDescription },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category updated successfully", category: updated });
  } catch (error) {
    return serverError(res, error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return serverError(res, error);
  }
};

export { addCategory, getCategories, updateCategory, deleteCategory };
