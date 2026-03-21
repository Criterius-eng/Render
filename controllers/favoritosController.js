import { addFavorite, removeFavorite, getFavoritesByUser } from "../database.js";

export async function addFavoriteController(req, res) {
    try {
        const { usuarioId, cultivoId } = req.body;
        await addFavorite(usuarioId, cultivoId);
        res.status(201).json({ message: "Favorito agregado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function removeFavoriteController(req, res) {
    try {
        const { usuarioId, cultivoId } = req.body;
        await removeFavorite(usuarioId, cultivoId);
        res.json({ message: "Favorito eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getFavoritesController(req, res) {
    try {
        const { usuarioId } = req.params;
        const favoritos = await getFavoritesByUser(usuarioId);
        res.json(favoritos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}