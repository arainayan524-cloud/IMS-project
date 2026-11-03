import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/Users.js";

const serverError = (res, error) => {
  console.log(error);
  return res.status(500).json({ success: false, message: "Server error" });
};

const addUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    // Login compares lowercase emails, so we always save it in lowercase
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const address = req.body.address?.trim();
    const role = req.body.role;

    if (!name || !email || !password || !address || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email, password, address and role are required" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters" });
    }
    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be admin or customer" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Never store the plain password
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashPassword, address, role });
    await newUser.save();

    return res.status(201).json({ success: true, message: "User added successfully" });
  } catch (error) {
    return serverError(res, error);
  }
};

const getUsers = async (req, res) => {
  try {
    // "-password" keeps the hashed passwords out of the response
    const users = await User.find().select("-password").sort({ _id: 1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return serverError(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // An admin must not delete the account they are logged in with
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot delete your own account" });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return serverError(res, error);
  }
};

export { addUser, getUsers, deleteUser };
