import jwt from "jsonwebtoken";
import { findUserForLogin, insertUser, findUserByCorreo } from "../database.js";

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// LOGIN
export async function login(req, res) {
    const { email, pass } = req.body;

    if (!email || !pass) {
        return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }

    try {
        const user = await findUserForLogin(email, pass);
        if (!user) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            message: "Login exitoso",
            user,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "No se pudo iniciar sesión" });
    }
}



// REGISTRAR 
export async function register(req, res) {

    const { nombre, apellidos, correo, pass } = req.body;

    if (!nombre || !apellidos || !correo || !pass) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passRegex.test(pass)) {
        return res.status(400).json({
            error: "La contraseña debe tener mínimo 8 caracteres e incluir letras y números.",
        });
    }

    try {
        const existing = await findUserByCorreo(correo);
        if (existing) {
            return res.status(400).json({ error: "Este correo ya está registrado." });
        }

        await insertUser(nombre, apellidos, correo, pass);

        return res.status(201).json({
            message: "Usuario creado correctamente"
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return res.status(500).json({ error: "No se pudo registrar el usuario" });
    }
}



// REFRESH TOKEN
export function refreshToken(req, res) {
    const { token } = req.body;
    if (!token) return res.status(403).json({ error: "Token requerido" });

    jwt.verify(token, REFRESH_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Refresh inválido" });

        const newAccessToken = jwt.sign({ id: decoded.id }, SECRET_KEY, { expiresIn: "15m" });
        res.json({ accessToken: newAccessToken });
    });
}
