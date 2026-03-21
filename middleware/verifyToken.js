import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
    console.log(" verifyToken EJECUTADO");

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];
    const SECRET_KEY = process.env.JWT_SECRET;

    console.log("SECRET EN VERIFY:", SECRET_KEY);

    jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] }, (err, decoded) => {
        if (err) {
            console.log("TOKEN INVÁLIDO:", err.message);
            return res.status(401).json({ error: "Token inválido" });
        }

        req.user = { id: decoded.id };
        console.log("TOKEN VÁLIDO, user:", decoded.id);
        next();
    });
}