from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from app.Mandani import mandani

app = FastAPI()

class SensorData(BaseModel):
    soilMoisture: float
    temperature: float
    humidity: float
    light: float

@app.post("/should-water")
def should_water(data: SensorData):
    time_zone = timezone(timedelta(hours=-6))
    hour = datetime.now(time_zone).hour

    if hour in [9, 16]:
        seconds = mandani(data.soilMoisture, data.temperature, data.light, data.humidity)

        return {'irrigation': True, 'seconds': seconds}
    
    return {"regar": False}