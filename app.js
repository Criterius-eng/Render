import express from "express";
import cors from "cors";

import perfilRoutes from './routes/profile.js';
import {
    getAllCrop,
    getGarden,
    getSensors
} from "./database.js";

// Importar controladores
import { 
    login, 
    register, 
    refreshToken 
} from "./controllers/authController.js";

import { 
    getUser, 
    removeUser 
} from "./controllers/userController.js";

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import { 
    addHomeVegetableGarden,
    addSensor,
    allHomeVegetableGarden,
    durationCrop,
    searchIdCrop
} from "./controllers/cropController.js"

import {
    sensorData,
    getSensorData,
    mandani
} from "./controllers/sensorController.js"

import cultivoRoutes from "./routes/cultivo.js";

import favoritos from "./routes/favoritos.js";

const corsOptions = {
    origin: "http://127.0.0.1:5173",
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || ".jpg";
        cb(null, `${Date.now()}${ext}`);
    },
})

const upload = multer({ storage })
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * USUARIO
 */
app.post("/login", login);
app.post("/register", register);
app.post("/refresh", refreshToken);

app.get("/user/:id", getUser);
app.delete("/user/:id", removeUser);

/**
 * SENSORES
 */
app.get("/sensor/:id", async (req, res) => {
    const sensor = await getSensors(req.params.id);
    res.status(200).send(sensor);
});

app.post("/addSensor", addSensor);

/**
 * HUERTO
*/

app.get("/durationCrop/:nombre", durationCrop);
app.post("/addHomeVegetableGarden", addHomeVegetableGarden);
app.get("/allHomeVegetableGarden/:id", allHomeVegetableGarden);

/**
 * CULTIVO
*/
app.use(cultivoRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
app.get("/searchIdCrop/:name", searchIdCrop);

/*
    Subir Imagen
*/

app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("image"), (req, res) => {
    res.json({
        message: "Imagen subida correctamente",
        filename: req.file.filename
    });
});

/*
    Datos de los sensores
*/

app.post("/sensorData", sensorData);
app.get("/getSensorData/:idSensor", getSensorData);

/**
 * PERFIL
*/
app.use(perfilRoutes);

/**
 * FASTAPI
 */

app.post("/should-water", mandani);

/*
 * FAVORITOS
*/

app.use("/favoritos", favoritos);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
