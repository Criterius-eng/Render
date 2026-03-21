import { getUserProfile } from '../database.js';

export async function perfil(req, res) {
    const { id } = req.params;

    try {
        const perfil = await getUserProfile(id);
        if (!perfil) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(perfil);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}