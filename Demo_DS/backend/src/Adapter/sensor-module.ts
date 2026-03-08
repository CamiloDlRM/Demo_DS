import { Module } from '@nestjs/common';
import { SensorsController } from './sensor-controller';
import { SensorService } from './sensore-services';
import { SensorFactory } from './sensor-factory';
import { PrismaService } from '../prisma.service';
import { AlertsModule } from '../observer/alerts/alerts.module'; // Para usar AlertsService

@Module({
  imports: [AlertsModule],          // Necesario para SensorService
  controllers: [SensorsController], // El controlador vive aquí
  providers: [
    SensorService,
    SensorFactory,
    PrismaService,                  // Si no tienes un módulo global de Prisma
  ],
  exports: [SensorService],         // Por si otros módulos lo necesitan
})
export class SensorsModule {}