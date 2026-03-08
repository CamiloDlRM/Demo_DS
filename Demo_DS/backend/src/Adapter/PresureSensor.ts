// src/sensors/adapters/pressure-sensor.adapter.ts
import { Injectable } from '@nestjs/common';
import { ISensor, SensorData } from './base-sensor';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PressureSensorAdapter implements ISensor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tankId: number,
    private readonly pressurePa: number, // lectura en Pascales
  ) {}

  async read(): Promise<SensorData> {
    const tank = await this.prisma.tank.findUnique({
      where: { id: this.tankId },
    });
    if (!tank) throw new Error(`Tanque ${this.tankId} no encontrado`);

    // Necesitamos altura y densidad del líquido. Asumimos agua (1000 kg/m³).
    // Podríamos obtener densidad de configuración global (Singleton) o de un campo en Tank.
    // Por ahora usamos constante.
    const density = 1000; // kg/m³
    const g = 9.81;
    const heightMeters = this.pressurePa / (density * g);
    const heightCm = heightMeters * 100;

    // Necesitamos la altura total del tanque para calcular porcentaje.
    let tankHeightCm = 200; // default
    if (tank.geometry) {
      const match = tank.geometry.match(/height[:\s]*(\d+)/i);
      if (match) tankHeightCm = parseInt(match[1], 10);
    }

    const levelLiters = (heightCm / tankHeightCm) * tank.capacityLiters;
    const percentage = (levelLiters / tank.capacityLiters) * 100;

    return {
      tankId: this.tankId,
      levelLiters: Math.max(0, Math.min(tank.capacityLiters, levelLiters)),
      percentage: Math.max(0, Math.min(100, percentage)),
      rawData: { pressurePa: this.pressurePa, heightCm },
    };
  }

  getSensorType(): string {
    return 'pressure';
  }
}