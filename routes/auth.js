import express from "express";
import { login, refreshToken, logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);             // Iniciar sesion
router.post("/refresh", refreshToken);    // Renovar accessToken
router.post("/logout", logout);           // Cerrar sesion

export default router;