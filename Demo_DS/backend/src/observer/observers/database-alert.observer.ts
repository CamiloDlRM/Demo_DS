/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PATRÓN OBSERVER – Observador Concreto #1: DatabaseAlertObserver
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsabilidad: persistir cada alerta generada en la tabla `Alert`
 * de PostgreSQL usando Prisma ORM.
 *
 * No persiste eventos de tipo NORMAL ya que no representan una condición
 * de alerta real; solo se loguean por los otros observadores.
 */
import { Injectable } from '@nestjs/common';
import { ITankObserver } from '../interfaces/tank-observer.interface';
import { TankAlertEvent, AlertType } from '../interfaces/tank-alert-event.interface';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DatabaseAlertObserver implements ITankObserver {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recibe el evento del Sujeto y lo persiste en la base de datos.
   * Los eventos NORMAL no se guardan para no saturar la tabla de alertas.
   */
  async update(event: TankAlertEvent): Promise<void> {
    // Los eventos NORMAL son informativos, no generan registro en BD
    if (event.alertType === AlertType.NORMAL) return;

    await this.prisma.alert.create({
      data: {
        tankId:       event.tankId,
        alertType:    event.alertType,
        currentLevel: event.currentLevel,
        percentage:   event.percentage,
        threshold:    event.threshold,
        message:      event.message,
      },
    });
  }
}
