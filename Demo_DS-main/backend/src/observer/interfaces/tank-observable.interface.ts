/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PATRÓN OBSERVER – Interfaz del Sujeto Observable (Subject)
 * ─────────────────────────────────────────────────────────────────────────────
 * Define el contrato que debe cumplir cualquier sujeto observable en el sistema.
 * El Sujeto concreto (TankLevelSubject) implementa esta interfaz.
 *
 * Los observadores se suscriben/desuscriben en tiempo de ejecución,
 * y el sujeto los notifica sin conocer sus implementaciones concretas.
 */
import { ITankObserver } from './tank-observer.interface';
import { TankAlertEvent } from './tank-alert-event.interface';

export interface ITankObservable {
  /**
   * Suscribe un observador a este sujeto.
   * Si ya está suscrito, no se duplica.
   */
  subscribe(observer: ITankObserver): void;

  /**
   * Elimina un observador de la lista de suscriptores.
   */
  unsubscribe(observer: ITankObserver): void;

  /**
   * Notifica a todos los observadores suscritos con el evento dado.
   * Se llama internamente cuando se detecta un cruce de umbral.
   */
  notify(event: TankAlertEvent): Promise<void>;
}
