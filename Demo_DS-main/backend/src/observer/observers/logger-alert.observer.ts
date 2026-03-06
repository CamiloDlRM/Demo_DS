/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PATRÓN OBSERVER – Observador Concreto #2: LoggerAlertObserver
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsabilidad: registrar cada evento de alerta en el sistema de logs
 * de NestJS con el nivel de severidad apropiado según el tipo de alerta.
 *
 * Niveles de log usados:
 *   - NIVEL_CRITICO / POSIBLE_FUGA → Logger.error()
 *   - NIVEL_BAJO / NIVEL_ALTO / LLENO → Logger.warn()
 *   - NORMAL → Logger.log()
 */
import { Injectable, Logger } from '@nestjs/common';
import { ITankObserver } from '../interfaces/tank-observer.interface';
import { TankAlertEvent, AlertType } from '../interfaces/tank-alert-event.interface';

@Injectable()
export class LoggerAlertObserver implements ITankObserver {
  private readonly logger = new Logger('TankAlerts');

  /**
   * Registra el evento en los logs del sistema con el nivel de severidad
   * apropiado para facilitar el monitoreo y la trazabilidad.
   */
  async update(event: TankAlertEvent): Promise<void> {
    const prefix = `[${event.alertType}] Tank "${event.tankName}" (ID:${event.tankId})`;
    const details = `${event.currentLevel.toFixed(1)}L (${event.percentage.toFixed(1)}%) | Umbral: ${event.threshold}`;

    switch (event.alertType) {
      case AlertType.NIVEL_CRITICO:
      case AlertType.POSIBLE_FUGA:
        this.logger.error(`${prefix} – ${event.message} | ${details}`);
        break;

      case AlertType.NIVEL_BAJO:
      case AlertType.NIVEL_ALTO:
      case AlertType.LLENO:
        this.logger.warn(`${prefix} – ${event.message} | ${details}`);
        break;

      case AlertType.NORMAL:
      default:
        this.logger.log(`${prefix} – ${event.message} | ${details}`);
        break;
    }
  }
}
