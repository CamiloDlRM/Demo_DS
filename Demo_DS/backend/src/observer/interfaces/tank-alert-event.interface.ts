/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PATRÓN OBSERVER – Definición del Evento
 * ─────────────────────────────────────────────────────────────────────────────
 * TankAlertEvent es el objeto que el Sujeto (TankLevelSubject) construye
 * y pasa a cada Observador (ITankObserver.update) cuando se cruza un umbral.
 *
 * Mantiene acoplamiento mínimo: los observadores solo reciben este objeto
 * y no necesitan conocer el origen ni la lógica de evaluación.
 */

/**
 * Tipos de alerta que puede generar el sistema.
 * - NIVEL_BAJO     : nivel por debajo del mínimo configurado
 * - NIVEL_CRITICO  : nivel por debajo del mínimo crítico (urgente)
 * - NIVEL_ALTO     : nivel por encima del máximo configurado
 * - LLENO          : tanque ha alcanzado su capacidad máxima
 * - POSIBLE_FUGA   : caída de nivel superior al umbral de fuga por minuto
 * - NORMAL         : nivel dentro de rangos normales (informativo, no se persiste)
 */
export enum AlertType {
  NIVEL_BAJO    = 'NIVEL_BAJO',
  NIVEL_CRITICO = 'NIVEL_CRITICO',
  NIVEL_ALTO    = 'NIVEL_ALTO',
  LLENO         = 'LLENO',
  POSIBLE_FUGA  = 'POSIBLE_FUGA',
  NORMAL        = 'NORMAL',
}

/** Evento propagado desde el Sujeto a todos los Observadores. */
export interface TankAlertEvent {
  /** ID del tanque que generó el evento */
  tankId: number;
  /** Nombre legible del tanque */
  tankName: string;
  /** Tipo de alerta detectado */
  alertType: AlertType;
  /** Nivel actual en litros al momento de la evaluación */
  currentLevel: number;
  /** Porcentaje de llenado al momento de la evaluación */
  percentage: number;
  /** Umbral que fue cruzado (en litros o L/min para fugas) */
  threshold: number;
  /** Timestamp de la detección */
  timestamp: Date;
  /** Mensaje descriptivo del evento */
  message: string;
}
