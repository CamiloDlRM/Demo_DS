/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PATRÓN OBSERVER – Observador Concreto #3: ConsoleNotificationObserver
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsabilidad: simular una notificación en tiempo real mostrando
 * un bloque visual formateado en la consola del servidor.
 *
 * En un sistema productivo este observer podría enviar:
 *   - Notificaciones push (WebSocket / Server-Sent Events)
 *   - Emails o SMS de alerta
 *   - Mensajes a Slack / Teams
 *
 * Para la demo académica produce un banner ASCII con la información relevante.
 */
import { Injectable } from '@nestjs/common';
import { ITankObserver } from '../interfaces/tank-observer.interface';
import { TankAlertEvent, AlertType } from '../interfaces/tank-alert-event.interface';

/** Iconos visuales por tipo de alerta para facilitar lectura en consola */
const ALERT_ICONS: Record<AlertType, string> = {
  [AlertType.NIVEL_BAJO]:    '🟡',
  [AlertType.NIVEL_CRITICO]: '🔴',
  [AlertType.NIVEL_ALTO]:    '🟠',
  [AlertType.LLENO]:         '🔵',
  [AlertType.POSIBLE_FUGA]:  '🚨',
  [AlertType.NORMAL]:        '🟢',
};

@Injectable()
export class ConsoleNotificationObserver implements ITankObserver {
  /**
   * Muestra un banner formateado en consola simulando una notificación
   * en tiempo real al operador del sistema.
   */
  async update(event: TankAlertEvent): Promise<void> {
    const icon = ALERT_ICONS[event.alertType] ?? '⚠️';
    const border = '═'.repeat(50);

    console.log(`\n╔${border}╗`);
    console.log(`║  ${icon}  NOTIFICACIÓN DE TANQUE${' '.repeat(22)}║`);
    console.log(`╠${border}╣`);
    console.log(`║  Tanque  : ${event.tankName.padEnd(38)}║`);
    console.log(`║  ID      : ${String(event.tankId).padEnd(38)}║`);
    console.log(`║  Tipo    : ${event.alertType.padEnd(38)}║`);
    console.log(`║  Nivel   : ${`${event.currentLevel.toFixed(1)} L (${event.percentage.toFixed(1)}%)`.padEnd(38)}║`);
    console.log(`║  Umbral  : ${`${event.threshold} L`.padEnd(38)}║`);
    console.log(`║  Hora    : ${event.timestamp.toLocaleString('es-CO').padEnd(38)}║`);
    console.log(`╠${border}╣`);
    // Truncar mensaje para que no desborde el banner
    const msg = event.message.length > 46 ? event.message.substring(0, 43) + '...' : event.message;
    console.log(`║  ${msg.padEnd(48)}║`);
    console.log(`╚${border}╝\n`);
  }
}
