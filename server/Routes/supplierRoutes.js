import express from "express";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";
import {
  addSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";

const router = express.Router();

// Any logged-in user can read suppliers (products will need them later)
router.get("/", authMiddleware, getSuppliers);

// Only admin can change them
router.post("/add", authMiddleware, adminOnly, addSupplier);
router.put("/:id", authMiddleware, adminOnly, updateSupplier);
router.delete("/:id", authMiddleware, adminOnly, deleteSupplier);

export default router;
