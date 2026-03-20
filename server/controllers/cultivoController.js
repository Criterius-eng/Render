import {
    getAllCrop,
    getCropById,
    getCropByName,
    getIdCrop,
    getDurationCrop,
    filterCrops,
    getCropRanges
} from "../database.js";


/**
 * Obtener todos los cultivos
 */
export const getCultivos = async (req, res) => {
    try {
        const cultivos = await getAllCrop();
        res.status(200).json(cultivos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener cultivos" });
    }
};

/**
 * Obtener cultivo por ID
 */
export const getCultivoById = async (req, res) => {
    try {
        const { id } = req.params;
        const cultivo = await getCropById(id);

        if (!cultivo) {
            return res.status(404).json({ error: "Cultivo no encontrado" });
        }

        res.status(200).json(cultivo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener cultivo" });
    }
};

/**
 * Obtener cultivo por nombre
 */
export const getCultivoByName = async (req, res) => {
    try {
        const { nombre } = req.params;
        const cultivo = await getCropByName(nombre);

        if (!cultivo) {
            return res.status(404).json({ error: "Cultivo no encontrado" });
        }

        res.status(200).json(cultivo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener cultivo" });
    }
};

/**
 * Obtener ID de cultivo por nombre
 */
export const searchIdCrop = async (req, res) => {
    try {
        const { nombre } = req.params;
        const id = await getIdCrop(nombre);

        if (!id) {
            return res.status(404).json({ error: "Cultivo no encontrado" });
        }

        res.status(200).json({ nombre, id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener ID del cultivo" });
    }
};

/**
 * Obtener duración de cultivo por nombre
 */
export const durationCrop = async (req, res) => {
    try {
        const { nombre } = req.params;
        const duracion = await getDurationCrop(nombre);

        if (!duracion) {
            return res.status(404).json({ error: "Cultivo no encontrado" });
        }

        res.status(200).json({ nombre, duracion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener duración del cultivo" });
    }
};

/**
 * Filtrar cultivos por tipo, dificultad y duración
 */
export const getCultivosByFilter = async (req, res) => {
    try {
        const { tipo, dificultad, duracionMin, duracionMax } = req.query;
        const cultivos = await filterCrops({ tipo, dificultad, duracionMin, duracionMax });

        res.status(200).json(cultivos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al filtrar cultivos" });
    }
};

/**
 * Verificar si los datos del sensor están dentro de los rangos del cultivo
 */
export const checkSensorRanges = async (req, res) => {
    const { nombreCultivo, sensorData } = req.body;

    try {
        const ranges = await getCropRanges(nombreCultivo);
        if (!ranges) return res.status(404).json({ error: "Cultivo no encontrado" });

        const checkRange = (value, min, max) => value >= min && value <= max;

        const result = {
            temperatura: {
                valor: sensorData.temp,
                estado: checkRange(sensorData.temp, ranges.temperatura_min, ranges.temperatura_max) ? "ok" : "fuera",
                min: ranges.temperatura_min,
                max: ranges.temperatura_max
            },
            humedadSuelo: {
                valor: sensorData.humedadSuelo,
                estado: checkRange(sensorData.humedadSuelo, ranges.humedadSuelo_min, ranges.humedadSuelo_max) ? "ok" : "fuera",
                min: ranges.humedadSuelo_min,
                max: ranges.humedadSuelo_max
            },
            humedadAmbiente: {
                valor: sensorData.humedadAmbiente,
                estado: checkRange(sensorData.humedadAmbiente, ranges.humedadAmbiental_min, ranges.humedadAmbiental_max) ? "ok" : "fuera",
                min: ranges.humedadAmbiental_min,
                max: ranges.humedadAmbiental_max
            },
            luz: {
                valor: sensorData.luz,
                estado: checkRange(sensorData.luz, ranges.luz_min, ranges.luz_max) ? "ok" : "fuera",
                min: ranges.luz_min,
                max: ranges.luz_max
            }
        };

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el servidor" });
    }
};