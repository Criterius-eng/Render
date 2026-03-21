import { getUserById, deleteUser } from "../database.js";

// GET USER BY ID
export async function getUser(req, res) {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error al consultar usuario:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

// DELETE USER
export async function removeUser(req, res) {
    try {
        const deleted = await deleteUser(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}