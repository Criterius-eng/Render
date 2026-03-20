import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt

def mandani(valueSoilMoisture, valueTemperature, valueLight, valueHumidity):
    soilMoisture = ctrl.Antecedent(np.arange(0, 101, 1), 'humedad_suelo')
    temperature = ctrl.Antecedent(np.arange(0, 41, 1), 'temperatura')
    light = ctrl.Antecedent(np.arange(0, 65001, 1), 'luz')
    humidity = ctrl.Antecedent(np.arange(0, 101, 1), 'humedad_ambiente')

    irrigation = ctrl.Consequent(np.arange(0,121, 1), 'riego')

    soilMoisture['baja'] = fuzz.trapmf(soilMoisture.universe, [0, 0, 30, 40])
    soilMoisture['optimo'] = fuzz.trimf(soilMoisture.universe, [30, 50, 70]) 
    soilMoisture['alta'] = fuzz.trapmf(soilMoisture.universe, [60, 75, 100, 100])

    temperature['baja'] = fuzz.trapmf(temperature.universe, [0, 0, 6, 14])
    temperature['optimo'] = fuzz.trimf(temperature.universe , [11, 18, 25])
    temperature['alta'] = fuzz.trapmf(temperature.universe, [20, 28, 40, 40])

    light['baja'] = fuzz.trapmf(light.universe, [0, 0, 8000, 10000])
    light['optimo'] = fuzz.trimf(light.universe, [9000, 29500, 50000])
    light['alta'] = fuzz.trapmf(light.universe, [49000, 53000, 65000, 65000])

    humidity['baja'] = fuzz.trapmf(humidity.universe, [0, 0, 50, 60])
    humidity['optimo'] = fuzz.trimf(humidity.universe, [45, 65, 85])
    humidity['alta'] = fuzz.trapmf(humidity.universe, [70, 80, 100, 100])

    irrigation['bajo'] = fuzz.trapmf(irrigation.universe, [0, 0, 15, 30])
    irrigation['medio'] = fuzz.trimf(irrigation.universe, [20, 40, 60])
    irrigation['alto'] = fuzz.trapmf(irrigation.universe, [50, 85, 120, 120])

    rule1 = ctrl.Rule(soilMoisture['baja'] & temperature['alta'] & light['alta'] & humidity['baja'], irrigation['alto'])
    rule2 = ctrl.Rule(soilMoisture['baja'] & temperature['optimo'] & light['optimo'], irrigation['medio'])
    rule3 = ctrl.Rule(soilMoisture['optimo'] & temperature['alta'] & light['alta'], irrigation['medio'])
    rule4 = ctrl.Rule(soilMoisture['alta'] & temperature['alta'] & light['alta'] & humidity['baja'], irrigation['bajo'])
    rule5 = ctrl.Rule(soilMoisture['optimo'] & temperature['optimo'] & light['optimo'] & humidity['optimo'], irrigation['bajo'])
    rule6 = ctrl.Rule(soilMoisture['baja'] & temperature['baja'] & light['baja'] & humidity['baja'], irrigation['medio'])
    rule7 = ctrl.Rule(soilMoisture['optimo'] & temperature['baja'] & light['baja'] & humidity['baja'], irrigation['bajo'])
    rule8 = ctrl.Rule(soilMoisture['alta'] & temperature['baja'] & light['baja'] & humidity['alta'], irrigation['bajo'])
    rule9 = ctrl.Rule(soilMoisture['baja'] & humidity['baja'], irrigation['alto'])
    rule10 = ctrl.Rule(soilMoisture['baja'] & temperature['alta'], irrigation['medio'])

    sistema_ctrl = ctrl.ControlSystem([rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9, rule10])
    simulacion = ctrl.ControlSystemSimulation(sistema_ctrl)


    simulacion.input['humedad_suelo'] = valueSoilMoisture
    simulacion.input['temperatura'] = valueTemperature
    simulacion.input['luz'] = valueLight
    simulacion.input['humedad_ambiente'] = valueHumidity

    simulacion.compute()

    return simulacion.output['riego']
