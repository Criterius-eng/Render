import {
    insertGarden,
    insertSensor,
    getAllGarden,
    getIdCrop,
    getDurationCrop
} from "../database.js";

// Buscar id del cultivo
export async function searchIdCrop(req, res){

    try {
        console.log(req.params.name);
        const result = await getIdCrop(req.params.name);
        res.json({
            idCrop: result
        });
    } catch(err){
        console.log("Error al buscar id del cultivo ", err);
    }
}

// Buscar el tiempo de duracion del cultivo
export async function durationCrop(req, res){
    try {
        const result = await getDurationCrop(req.params.nombre);
        res.json({
            duration: result
        });
    } catch (err){
        console.log("Error al buscar duracion del huerto: ", err);
    }

}

// Agregar sensor
export async function addSensor(req, res){
    const {
        idUsuario,
        name
    } = req.body;

    try {
        const result = await insertSensor(idUsuario, name);

        res.json({
            idSensor: result
        });
    } catch (err) {
        console.log("Error al registrar sensor: ", err);
    }
}

// Agregar huerto
export async function allHomeVegetableGarden(req, res){
    try{
        const result = await getAllGarden(req.params.id);
        res.status(200).send(result);

    } catch(err){
        console.log("Error al mostrar los huertos: ", err)
    }
}

export async function addHomeVegetableGarden(req, res){
    const { 
        idSensor,
        idCultivo,
        nombre,
        fechaInicio,
        fechaEstimada, 
        estado, 
        imagen } = req.body;

        try {
            const result = await insertGarden(idSensor,
                idCultivo,
                nombre,
                fechaInicio,
                fechaEstimada,
                estado,
                imagen);

            res.json({
                message: "Si funciono",
            });
            
        }catch(err){
            console.log("Error al registrar huerto: ", err);
        };
}
