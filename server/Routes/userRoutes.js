import express from "express";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";
import { addUser, getUsers, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// Everything about users is admin only
router.use(authMiddleware, adminOnly);

router.get("/", getUsers);
router.post("/add", addUser);
router.delete("/:id", deleteUser);

export default router;
