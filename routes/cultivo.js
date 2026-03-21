import express from "express";
import { 
  getCultivos, 
  getCultivoById, 
  getCultivoByName, 
  searchIdCrop, 
  durationCrop, 
  getCultivosByFilter, 
  checkSensorRanges 
} from "../controllers/cultivoController.js";

const router = express.Router();

/**
 * Rutas de cultivo
 */
router.get("/crop", getCultivos);                  // Todos los cultivos
router.get("/crop/id/:id", getCultivoById);        // Cultivo por ID
router.get("/crop/nombre/:nombre", getCultivoByName); // Cultivo por nombre
router.get("/searchIdCrop/:nombre", searchIdCrop); // ID de cultivo por nombre
router.get("/durationCrop/:nombre", durationCrop); // Duración de cultivo por nombre
router.get("/crop/filter", getCultivosByFilter);   // Filtrar cultivos
router.post("/checkSensorRanges", checkSensorRanges); // Validar rangos de sensores

export default router;