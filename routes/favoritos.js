import express from "express";
import {
    addFavoriteController,
    removeFavoriteController,
    getFavoritesController
} from "../controllers/favoritosController.js";

const router = express.Router();

router.post("/", addFavoriteController);         // POST /favoritos
router.delete("/", removeFavoriteController);    // DELETE /favoritos
router.get("/:usuarioId", getFavoritesController); // GET /favoritos/:usuarioId

export default router;