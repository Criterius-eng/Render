import express from "express";
import { getUserById, deleteUser } from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/:id", verifyToken, getUserById);
router.delete("/:id", verifyToken, deleteUser);

export default router;
