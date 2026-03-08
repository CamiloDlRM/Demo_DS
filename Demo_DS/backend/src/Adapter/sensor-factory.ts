import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UltrasonicSensorAdapter } from './UltraSonicSensor';
import { PressureSensorAdapter } from './PresureSensor';


@Injectable()
export class SensorFactory {
  constructor(private readonly prisma: PrismaService) {}

  createUltrasonicAdapter(tankId: number, distanceCm: number) {
    return new UltrasonicSensorAdapter(this.prisma, tankId, distanceCm);
  }

  createPressureAdapter(tankId: number, pressurePa: number) {
    return new PressureSensorAdapter(this.prisma, tankId, pressurePa);
  }

}