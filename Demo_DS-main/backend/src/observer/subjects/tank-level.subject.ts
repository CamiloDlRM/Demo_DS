/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PATRÓN OBSERVER – Sujeto Concreto: TankLevelSubject
 * ─────────────────────────────────────────────────────────────────────────────
 * Es el núcleo del patrón Observer en este módulo.
 *
 * Responsabilidades:
 *   1. Mantener la lista de observadores suscritos
 *   2. Recibir una nueva lectura de sensor
 *   3. Evaluar si el nivel cruza algún umbral configurado
 *   4. Construir el TankAlertEvent correspondiente
 *   5. Notificar a TODOS los observadores mediante notify()
 *
 * Los observadores se inyectan via NestJS DI (no están hardcodeados en la lógica),
 * lo que permite agregar o quitar observadores sin modificar esta clase.
 */
import { Injectable } from '@nestjs/common';
import { ITankObservable } from '../interfaces/tank-observable.interface';
import { ITankObserver } from '../interfaces/tank-observer.interface';
import { TankAlertEvent, AlertType } from '../interfaces/tank-alert-event.interface';
import { DatabaseAlertObserver } from '../observers/database-alert.observer';
import { LoggerAlertObserver } from '../observers/logger-alert.observer';
import { ConsoleNotificationObserver } from '../observers/console-notification.observer';

/** Datos de entrada que llegan de la lectura de sensor */
export interface ReadingInput {
  tankId: number;
  tankName: string;
  levelLiters: number;
  percentage: number;
  /** Nivel previo (para detección de fugas). Opcional. */
  previousLevelLiters?: number;
  /** Minutos transcurridos desde la lectura anterior. Opcional. */
  minutesSinceLastReading?: number;
  thresholds: {
    minLevel: number;
    criticalMin: number;
    maxLevel: number;
    capacityLiters: number;
    leakThreshold: number;
  };
}

@Injectable()
export class TankLevelSubject implements ITankObservable {
  /**
   * ── Lista de observadores suscritos ──────────────────────────────────────
   * El Sujeto SOLO conoce la interfaz ITankObserver, nunca las clases concretas.
   * Esto permite agregar nuevos observadores (email, SMS, SSE) sin tocar esta clase.
   */
  private observers: ITankObserver[] = [];

  constructor(
    // Observadores inyectados via NestJS DI
    private readonly dbObserver: DatabaseAlertObserver,
    private readonly loggerObserver: LoggerAlertObserver,
    private readonly consoleObserver: ConsoleNotificationObserver,
  ) {
    // ── Suscripción inicial de los tres observadores concretos ──────────────
    // Se hace en el constructor usando la interfaz, no la implementación.
    this.subscribe(this.dbObserver);
    this.subscribe(this.loggerObserver);
    this.subscribe(this.consoleObserver);
  }

  // ── Gestión de suscriptores (patrón Observable) ──────────────────────────

  /** Agrega un observador si aún no está suscrito */
  subscribe(observer: ITankObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  /** Elimina un observador de la lista */
  unsubscribe(observer: ITankObserver): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  /**
   * Notifica a TODOS los observadores suscritos con el evento dado.
   * Llama a update() en cada uno de forma secuencial.
   */
  async notify(event: TankAlertEvent): Promise<void> {
    for (const observer of this.observers) {
      await observer.update(event);
    }
  }

  // ── Lógica de evaluación de umbrales ─────────────────────────────────────

  /**
   * Evalúa una lectura de sensor contra los umbrales configurados.
   * Construye TankAlertEvent(s) para cada condición detectada y los notifica.
   *
   * @returns Array de eventos generados (vacío si el nivel es NORMAL)
   */
  async evaluateReading(input: ReadingInput): Promise<TankAlertEvent[]> {
    const { tankId, tankName, levelLiters, percentage, thresholds } = input;
    const events: TankAlertEvent[] = [];
    const now = new Date();

    // ── Evaluación de umbrales de nivel ─────────────────────────────────────

    if (levelLiters <= thresholds.criticalMin) {
      // Prioridad máxima: nivel crítico (por debajo del mínimo crítico)
      events.push({
        tankId,
        tankName,
        alertType: AlertType.NIVEL_CRITICO,
        currentLevel: levelLiters,
        percentage,
        threshold: thresholds.criticalMin,
        timestamp: now,
        message: `Nivel CRÍTICO: ${levelLiters.toFixed(1)}L está por debajo del mínimo crítico (${thresholds.criticalMin}L). Acción inmediata requerida.`,
      });
    } else if (levelLiters <= thresholds.minLevel) {
      // Nivel bajo pero no crítico
      events.push({
        tankId,
        tankName,
        alertType: AlertType.NIVEL_BAJO,
        currentLevel: levelLiters,
        percentage,
        threshold: thresholds.minLevel,
        timestamp: now,
        message: `Nivel BAJO: ${levelLiters.toFixed(1)}L está por debajo del mínimo permitido (${thresholds.minLevel}L).`,
      });
    } else if (levelLiters >= thresholds.capacityLiters) {
      // Tanque a capacidad máxima
      events.push({
        tankId,
        tankName,
        alertType: AlertType.LLENO,
        currentLevel: levelLiters,
        percentage,
        threshold: thresholds.capacityLiters,
        timestamp: now,
        message: `Tanque LLENO: ${levelLiters.toFixed(1)}L ha alcanzado la capacidad máxima (${thresholds.capacityLiters}L).`,
      });
    } else if (levelLiters >= thresholds.maxLevel) {
      // Nivel alto pero no lleno
      events.push({
        tankId,
        tankName,
        alertType: AlertType.NIVEL_ALTO,
        currentLevel: levelLiters,
        percentage,
        threshold: thresholds.maxLevel,
        timestamp: now,
        message: `Nivel ALTO: ${levelLiters.toFixed(1)}L superó el umbral máximo (${thresholds.maxLevel}L).`,
      });
    }

    // ── Detección de posible fuga (independiente del nivel absoluto) ─────────
    if (
      input.previousLevelLiters !== undefined &&
      input.minutesSinceLastReading !== undefined &&
      input.minutesSinceLastReading > 0
    ) {
      const drop = input.previousLevelLiters - levelLiters;
      if (drop > 0) {
        const dropPerMinute = drop / input.minutesSinceLastReading;
        if (dropPerMinute >= thresholds.leakThreshold) {
          events.push({
            tankId,
            tankName,
            alertType: AlertType.POSIBLE_FUGA,
            currentLevel: levelLiters,
            percentage,
            threshold: thresholds.leakThreshold,
            timestamp: now,
            message: `POSIBLE FUGA: caída de ${dropPerMinute.toFixed(2)}L/min supera el umbral (${thresholds.leakThreshold}L/min). Verificar tanque.`,
          });
        }
      }
    }

    // ── Notificar o retornar NORMAL ──────────────────────────────────────────

    if (events.length === 0) {
      // Sin alertas: notificar estado NORMAL a logger y consola (no a BD)
      const normalEvent: TankAlertEvent = {
        tankId,
        tankName,
        alertType: AlertType.NORMAL,
        currentLevel: levelLiters,
        percentage,
        threshold: 0,
        timestamp: now,
        message: `Nivel NORMAL: ${levelLiters.toFixed(1)}L (${percentage.toFixed(1)}%) dentro de rangos permitidos.`,
      };
      // notify() llama a todos los observadores, incluida la BD que descarta NORMAL
      await this.notify(normalEvent);
      return [normalEvent];
    }

    // Para cada evento de alerta: notificar a TODOS los observadores
    for (const event of events) {
      await this.notify(event); // ← PUNTO CLAVE del patrón Observer
    }

    return events;
  }
}
