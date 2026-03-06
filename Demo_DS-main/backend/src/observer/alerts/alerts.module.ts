import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { TankLevelSubject } from '../subjects/tank-level.subject';
import { DatabaseAlertObserver } from '../observers/database-alert.observer';
import { LoggerAlertObserver } from '../observers/logger-alert.observer';
import { ConsoleNotificationObserver } from '../observers/console-notification.observer';
import { PrismaService } from '../../prisma.service';

/**
 * AlertsModule: módulo NestJS que agrupa toda la lógica del patrón Observer.
 *
 * Providers registrados:
 *   - TankLevelSubject          ← Sujeto Observable
 *   - DatabaseAlertObserver     ← Observador concreto #1
 *   - LoggerAlertObserver       ← Observador concreto #2
 *   - ConsoleNotificationObserver ← Observador concreto #3
 *   - AlertsService             ← Servicio que orquesta el flujo
 */
@Module({
  controllers: [AlertsController],
  providers: [
    PrismaService,
    AlertsService,
    // Sujeto del patrón Observer
    TankLevelSubject,
    // Observadores concretos (inyectados en TankLevelSubject via NestJS DI)
    DatabaseAlertObserver,
    LoggerAlertObserver,
    ConsoleNotificationObserver,
  ],
  exports: [AlertsService, TankLevelSubject],
})
export class AlertsModule {}
