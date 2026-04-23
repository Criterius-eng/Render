import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

import perfilRoutes from './routes/profile.js';
import {
    getAllCrop,
    getGarden,
    getHistorialRiego,
    getSensors,
    getUltimoRiego
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
import { perfil } from "./controllers/profileController.js";

const corsOptions = {
    origin: "http://127.0.0.1:5173",
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const storage = multer.memoryStorage();

const upload = multer({ storage })
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);
/**
 * USUARIO
 */
app.post("/login", login);
app.post("/register", register);
app.post("/refresh", refreshToken);

app.get("perfil/:id", perfil);
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

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;

        if (!file){
            return res.status(400).json({error: "No se envio archivo"});
        }

        const fileName = `Sensores/${Date.now()}-${file.originalname}`;

        const { data, error } = await supabase.storage
            .from("uploads")
            .upload(fileName, file.buffer,{
                contentType: file.mimetype,
            });
        
        if (error){
            console.error(error);
            return res.status(500).json({ error: "Error subiendo archivo"});
        }

        const { data: urlData } = supabase.storage
            .from("uploads")
            .getPublicUrl(fileName);
        
        res.json({
            message: "Archivo subido correctamente",
            url: urlData.publicUrl,
        });
    } catch (error) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor "});

    }
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


/*
 * HISTORIAL DE REGADO 
*/

app.get("/getHistorialRiego/:idHuerto", async (req, res) => {
    const { idHuerto } = req.params;
    try {
        const historial = await getHistorialRiego(idHuerto);
        res.json(historial);
    } catch(error){
        console.log("Error al obtener historial de riego: ", error.message);
        res.status(500).json({error: "Error al obtener historial de riego"});
    }
})

app.get("/getUltimoRiego/:idHuerto", async (req, res) => {
    const { idHuerto } = req.params;
    try {
        const ultimo = await getUltimoRiego(idHuerto);
        res.json(ultimo);
    } catch (error){
        console.log("Error al obtener ultimo riego: ", error.message);
        res.status(500).json({error: "Error al obtener ultimo riego"});
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});