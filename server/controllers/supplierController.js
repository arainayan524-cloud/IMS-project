import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";

const serverError = (res, error) => {
  console.log(error);
  return res.status(500).json({ success: false, message: "Server error" });
};

// Trim the 4 fields coming from the form
const readFields = (body) => ({
  name: body.name?.trim(),
  email: body.email?.trim(),
  number: body.number?.trim(),
  address: body.address?.trim(),
});

// Returns an error message, or null when everything is fine
const validate = ({ name, email, number, address }) => {
  if (!name || !email || !number || !address) {
    return "Name, email, phone number and address are required";
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

const addSupplier = async (req, res) => {
  try {
    const fields = readFields(req.body);
    const problem = validate(fields);
    if (problem) {
      return res.status(400).json({ success: false, message: problem });
    }

    const existingSupplier = await Supplier.findOne({ name: fields.name });
    if (existingSupplier) {
      return res.status(409).json({ success: false, message: "Supplier already exists" });
    }

    const newSupplier = new Supplier(fields);
    await newSupplier.save();

    return res.status(201).json({ success: true, message: "Supplier added successfully" });
  } catch (error) {
    return serverError(res, error);
  }
};

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, suppliers });
  } catch (error) {
    return serverError(res, error);
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    const fields = readFields(req.body);
    const problem = validate(fields);
    if (problem) {
      return res.status(400).json({ success: false, message: problem });
    }

    // Another supplier must not already use this name
    const duplicate = await Supplier.findOne({ name: fields.name, _id: { $ne: id } });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "Supplier already exists" });
    }

    const updated = await Supplier.findByIdAndUpdate(id, fields, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Supplier updated successfully", supplier: updated });
  } catch (error) {
    return serverError(res, error);
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    const deleted = await Supplier.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    return res.status(200).json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    return serverError(res, error);
  }
};

export { addSupplier, getSuppliers, updateSupplier, deleteSupplier };
