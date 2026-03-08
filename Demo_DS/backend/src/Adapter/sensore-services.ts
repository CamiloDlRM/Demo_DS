import { Injectable } from '@nestjs/common';
import { ISensor, SensorData } from './base-sensor';
import { AlertsService } from '../observer/alerts/alerts.service'; // Ajusta la ruta según tu estructura

@Injectable()
export class SensorService {
  constructor(private readonly alertsService: AlertsService) {}

  async processSensorReading(sensorAdapter: ISensor): Promise<any> {
    const data = await sensorAdapter.read();
    return this.alertsService.evaluate({
      tankId: data.tankId,
      levelLiters: data.levelLiters,
      percentage: data.percentage,
      temperatureC: data.temperature,
      distanceCm: data.distance,
      previousLevelLiters: data.previousLevelLiters,
      minutesSinceLastReading: data.minutesSinceLastReading,
    });
  }
}