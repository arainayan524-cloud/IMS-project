import express from "express";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Any logged-in user can read categories (products will need them later)
router.get("/", authMiddleware, getCategories);

// Only admin can change them
router.post("/add", authMiddleware, adminOnly, addCategory);
router.put("/:id", authMiddleware, adminOnly, updateCategory);
router.delete("/:id", authMiddleware, adminOnly, deleteCategory);

export default router;
