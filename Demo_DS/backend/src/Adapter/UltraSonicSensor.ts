import { Injectable } from '@nestjs/common';
import { ISensor, SensorData } from './base-sensor';
import { PrismaService } from '../prisma.service'; // Ajusta ruta

@Injectable()
export class UltrasonicSensorAdapter implements ISensor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tankId: number,
    private readonly distanceCm: number, // lectura del sensor
  ) {}

  async read(): Promise<SensorData> {
    // Obtener datos del tanque desde BD
    const tank = await this.prisma.tank.findUnique({
      where: { id: this.tankId },
    });
    if (!tank) {
      throw new Error(`Tanque ${this.tankId} no encontrado`);
    }

    // Necesitamos la altura del tanque para convertir distancia a nivel.
    // Podríamos tener un campo geometry que almacene dimensiones.
    // Por simplicidad, asumimos que la geometría es un string con formato "altura_cm"
    // o podríamos añadir un campo height. Lo ideal sería parsear la geometría.
    // Aquí asumiremos que la altura está almacenada en geometry (ej. "height:200").
    let heightCm = 200; // valor por defecto
    if (tank.geometry) {
      const match = tank.geometry.match(/height[:\s]*(\d+)/i);
      if (match) {
        heightCm = parseInt(match[1], 10);
      }
    }

    const levelLiters = ((heightCm - this.distanceCm) / heightCm) * tank.capacityLiters;
    const percentage = (levelLiters / tank.capacityLiters) * 100;

    return {
      tankId: this.tankId,
      levelLiters: Math.max(0, Math.min(tank.capacityLiters, levelLiters)),
      percentage: Math.max(0, Math.min(100, percentage)),
      distance: this.distanceCm,
    };
  }

  getSensorType(): string {
    return 'ultrasonic';
  }
}