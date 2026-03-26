import dotenv from 'dotenv';
import axios from 'axios';
import {
    searchForSensorByName,
    searchForGardenByIdSensor,
    insertHistorialRiego,
    lastValueRecordedSensorData,
    insertSensorData
} from "../database.js";

dotenv.config();

export async function sensorData(req, res){
    const {
        device_id,
        nombre,
        temperatura,
        humedadAmbiente,
        humedadSuelo,
        luz
    } = req.body;

    try {
        const id = await searchForSensorByName(nombre);
        const result = await insertSensorData(id, temperatura, humedadAmbiente, humedadSuelo, luz);
        
        res.json({
            message: "Si funciono" //Cambiar message
        });

    } catch(err){
        console.log("Error al registrar datos del sensor: ", err);
    }
}

export async function getSensorData(req, res){

    try {
        const result = await lastValueRecordedSensorData(req.params.idSensor);
        res.json({
            temperature: result.temperatura,
            humedity: result.humedadAmbiente,
            soilMoisture: result.humedadSuelo,
            light: result.luz,
        });
    } catch(error) {
        console.log("Error al cargar datos del sensor: ", error);
    }
}

export async function mandani(req, res){
    const {
        deviceName,
        soilMoisture,
        temperature,
        humidity,
        light
    } = req.body;
    try{
        const response = await axios.post(process.env.API_URL + "/should-water", {
            soilMoisture: soilMoisture,
            temperature: temperature,
            humidity: humidity,
            light: light
        });
        console.log("Nombre del sensor: ", deviceName);
        const idSensor = await searchForSensorByName(deviceName);
        console.log("ID del sensor: ", idSensor);
        const idGarden = await searchForGardenByIdSensor(idSensor);
        const result = await insertHistorialRiego(idGarden, response.data[1]);

        res.json(response.data);
    } catch(error){
        console.log("Error en mandani", error);
    }
}