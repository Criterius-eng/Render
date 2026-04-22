import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE
})

/*
 *  Consultas en la tabla usuario
*/


// INSERTAR USUARIO: guarda contraseña cifrada
export async function insertUser(name, lastName, email, pass) {
    const hashedPass = await bcrypt.hash(pass, 10);

    const result = await pool.query(
        `INSERT INTO usuario (nombre, apellidos, correo, pass) VALUES ($1, $2, $3, $4)`,
        [name, lastName, email, hashedPass]
    );
    return result;
}

// LOGIN
export async function findUserForLogin(email, pass) {
    const rows = await pool.query(
        `SELECT * FROM usuario WHERE correo = $1`,
        [email]
    );

    if (!rows.rows[0].id) return false;

    // Compara contraseña ingresada con la cifrada
    const match = await bcrypt.compare(pass, rows.rows[0].pass);

    return match ? { id: rows.rows[0].id, nombre: rows.rows[0].nombre, correo: rows.rows[0].correo } : false;
}


// BUSCAR POR CORREO (para validar duplicados)
export async function findUserByCorreo(correo) {
    const rows = await pool.query(
        `SELECT * FROM usuario WHERE correo = $1`,
        [correo]
    );

    return rows.rowCount > 0 ? true : false;
}

// OBTENER USUARIO POR ID
export async function getUserById(id) {
    const rows = await pool.query(
        `SELECT id, nombre, apellidos, correo FROM usuario WHERE id = $1`,
        [id]
    );
    return rows.rows[0];
}

// ELIMINAR USUARIO (Se necesita esto ¿?)
export async function deleteUser(id) {
    const result = await pool.query(
        `DELETE FROM usuario WHERE id = $1`,
        [id]
    );
    return result.affectedRows > 0; // true si se eliminó
}

/*
 * Consultas de perfil
*/

// PERFIL: obtener datos del usuario + historial de huertos
export async function getUserProfile(idUsuario) {
    // Datos básicos del usuario
    const userRows = await pool.query(
        `SELECT id, nombre, apellidos, correo 
         FROM usuario 
         WHERE id = $1`,
        [idUsuario]
    );

    if (!userRows.rows[0]) return null;

    // Historial desde la vista (usa idUsuario)
    const historialRows = await pool.query(
        `SELECT * FROM vista_historial_huertos WHERE "idUsuario" = $1`,
        [idUsuario]
    );

    return {
        id: userRows.rows[0].id,
        nombre: userRows.rows[0].nombre,
        apellidos: userRows.rows[0].apellidos,
        correo: userRows.rows[0].correo,
        historial: historialRows.rows[0]
    };
}


/*
 *  Consultas en la tabla sensor 
*/

export async function getSensors(idUsuario) {
    const row = await pool.query(
        `SELECT * FROM sensor WHERE "idUsuario" = $1`,
        [idUsuario]
    );
    return row.rows[0];
}

export async function searchForSensorByName(name) {
    const row = await pool.query(
        `SELECT * FROM sensor WHERE "deviceName" = $1`,
        [name]
    );
    const sensorID = row.rows[0].idSensor;
    return sensorID;
}

export async function insertSensor(idUsuario, name) {
    const result = await pool.query(
        `INSERT INTO sensor ("idUsuario", "deviceName") VALUES ($1, $2) RETURNING "idSensor"`,
        [idUsuario, name]
    );
    const sensorID = result.rows[0].idSensor;
    return sensorID;
}

/*
 *  Consultas en la tabla de sensor_data 
 */

export async function insertSensorData(idSensor, temperature, humedity, soilMoisture, light) {
    const result = await pool.query(
        `INSERT INTO sensor_data ("idSensor", temperatura, "humedadAmbiente", "humedadSuelo", luz) VALUES ($1, $2, $3, $4, $5)`,
        [idSensor, temperature, humedity, soilMoisture, light]
    );

    return result;
}

export async function lastValueRecordedSensorData(idSensor) {
    const result = await pool.query(
        `SELECT * FROM sensor_data WHERE "idSensor" = $1 ORDER BY "idSensorData" DESC LIMIT 1`,
        [idSensor]
    );

    return result.rows[0];
}

// IGUAL ESTO ES NECESARIO
export async function deleteSensor(id) {
    const result = await pool.query(
        `DELETE FROM sensor WHERE id = $1`,
        [id]
    );
    return result;
}

export async function updateSensor(id, name) {
    const result = await pool.query(
        `UPDATE sensor SET nombre = $1 WHERE id = $2`,
        [name, id]
    );
    return result;
}

/*
 *  Consultas en la tabla huerto
*/
export async function getAllGarden(idUsuario) {
    const row = await pool.query(
        `SELECT * FROM vw_home WHERE usuario = $1`,
        [idUsuario]
    );
    return row.rows;
}

export async function getGarden(idSensor) {
    const row = await pool.query(
        `SELECT * FROM huerto WHERE "idSensor" = $1`,
        [idSensor]
    );
    return row.rows[0];
}

export async function insertGarden(idSensor, idCultivo, nombre, fechaInicio, fechaEstimada, estado, imagen) {
    const result = await pool.query(
        `INSERT INTO huerto ("idSensor", "idCultivo", nombre, "fechaInicio", "fechaEstimada", estado, imagen) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [idSensor, idCultivo, nombre, fechaInicio, fechaEstimada, estado, imagen]

    );
    return result;
}

export async function searchForGardenByIdSensor(name) {
    const result = await pool.query(
        `SELECT * FROM huerto WHERE "idSensor" = $1`,
        [name]
    );

    return result.rows[0].idHuerto;
}

export async function gardenCompleted(idHuerto){
    const result = await pool.query(
        `UPDATE huerto SET "fechaFin" = CURRENT_DATE, estado = TRUE WHERE "idHuerto" = $1`,
        [idHuerto]
    );
}

export async function lastValueRecordedGarden(id){
    const result = await pool.query(
        `SELECT * FROM huerto WHERE "idSensor" = $1 ORDER BY "idHuerto" DESC LIMIT 1`,
        [id]
    );

    return result.rows[0].idHuerto;
}

/*
 *  Consultas en la tabla cultivo
*/

export async function getIdCrop(name) {
    const row = await pool.query(
        `SELECT * FROM cultivo WHERE nombre = $1`,
        [name]
    );
    const cropId = row.rows[0].id;
    return cropId;
}

export async function getDurationCrop(name) {
    const row = await pool.query(
        `SELECT * FROM cultivo WHERE nombre = $1`,
        [name]
    );
    const duration = row.rows[0].duracion;
    return duration;
}

export async function getAllCrop() {
    const row = await pool.query(
        `SELECT * FROM cultivo`
    );

    return row.rows;
}

export async function insertCrop(name, kind, difficult, description, tips) {
    const result = await pool.query(
        `INSERT INTO cultivo (nombre, tipo, dificultad, descripcion, consejos)
     VALUES ($1, $2, $3, $4, $5)`,
        [name, kind, difficult, description, tips]
    );
    return result;
}

export async function searchCrop(name) {
    const rows = await pool.query(
        `SELECT * FROM cultivo WHERE nombre = $1`,
        [name]
    );
    return rows.rows;
}
// Consultar rangos de un cultivo por nombre
export async function getCropRanges(name) {
    const rows = await pool.query(
        `SELECT 
        "humedadAmbiental_min", "humedadAmbiental_max",
        "humedadSuelo_min", "humedadSuelo_max",
        temperatura_min, temperatura_max,
        luz_min, luz_max
     FROM cultivo
     WHERE nombre = $1`,
        [name]
    );
    return rows.rows[0];
}

// Obtener cultivo por ID
export async function getCropById(id) {
    const rows = await pool.query(
        `SELECT * FROM cultivo WHERE id = $1`,
        [id]
    );
    return rows.rows[0];
}

// Obtener cultivo por nombre
export async function getCropByName(name) {
    const rows = await pool.query(
        `SELECT * FROM cultivo WHERE nombre = $1`,
        [name]
    );
    return rows.rows[0];
}

// Filtrar cultivos por tipo, dificultad y duración
export async function filterCrops({ tipo, dificultad, duracionMin, duracionMax }) {
    let query = "SELECT * FROM cultivo WHERE 1=1";
    const params = [];

    if (tipo) {
        query += " AND tipo = $1";
        params.push(tipo);
    }
    if (dificultad) {
        query += " AND dificultad = $1";
        params.push(dificultad);
    }
    if (duracionMin) {
        query += " AND duracion >= $1";
        params.push(duracionMin);
    }
    if (duracionMax) {
        query += " AND duracion <= $1";
        params.push(duracionMax);
    }
    const rows = await pool.query(query, params);
    return rows.rows;
}

/*
 *  Consultas en la tabla favoritos
*/

// Agregar un cultivo a favoritos de un usuario
export async function addFavorite(usuarioId, cultivoId) {
    const result = await pool.query(
        `INSERT INTO favoritos (usuario_id, cultivo_id) VALUES ($1, $2)`,
        [usuarioId, cultivoId]
    );
    return result;
}

// Eliminar un cultivo de favoritos de un usuario
export async function removeFavorite(usuarioId, cultivoId) {
    const result = await pool.query(
        `DELETE FROM favoritos WHERE usuario_id = $1 AND cultivo_id = $2`,
        [usuarioId, cultivoId]
    );
    return result;
}

// Obtener todos los favoritos de un usuario 
export async function getFavoritesByUser(usuarioId) {
    const rows = await pool.query(
        `SELECT c.* 
         FROM cultivo c
         INNER JOIN favoritos f ON c.id = f.cultivo_id
         WHERE f.usuario_id = $1`,
        [usuarioId]
    );
    return rows.rows;
}

// Verificar si un cultivo ya está en favoritos de un usuario
export async function isFavorite(usuarioId, cultivoId) {
    const rows = await pool.query(
        `SELECT * FROM favoritos WHERE usuario_id = $1 AND cultivo_id = $2`,
        [usuarioId, cultivoId]
    );
    return rows.rowCount > 0;
}

/*
 * Consulta en la tabla historial_regado 
*/

export async function insertHistorialRiego(idHuerto, duaration) {
    const result = await pool.query(
        `INSERT INTO historial_regado ("idHuerto", duracion) VALUES ($1, $2)`,
        [idHuerto, duaration]
    );

    return result;
}

export async function getHistorialRiego(idHuerto){
    const rows = await pool.query(
        `SELECT * FROM historial_regado WHERE = $1 ORDER BY fecha DESC, hora DESC`
        [idHuerto]
    );
    return rows.rows;
}

export async function getUltimoRiego(idHuerto) {
    const rows = await pool.query(
        `SELECT * FROM historial_regado WHERE idHuerto = $1 ORDER BY fecha DESC, hora DESC LIMIT 1`,
        [idHuerto]
    );
    return rows.rowCount > 0 ? rows.rows[0] : null;
}
