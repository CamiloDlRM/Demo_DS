/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PATRÓN OBSERVER – Interfaz del Observador (Observer)
 * ─────────────────────────────────────────────────────────────────────────────
 * Cualquier clase que implemente ITankObserver puede suscribirse al
 * TankLevelSubject y recibirá notificaciones cuando se crucen umbrales.
 *
 * Observadores concretos:
 *   - DatabaseAlertObserver  → persiste la alerta en PostgreSQL
 *   - LoggerAlertObserver    → registra en el log del sistema
 *   - ConsoleNotificationObserver → notificación formateada en consola
 */
import { TankAlertEvent } from './tank-alert-event.interface';

export interface ITankObserver {
  /**
   * Llamado por el Sujeto cuando se detecta un cruce de umbral.
   * @param event Datos completos del evento de alerta
   */
  update(event: TankAlertEvent): Promise<void>;
}
