import { Module } from '@nestjs/common';
import { AlertsModule } from './alerts/alerts.module';

/**
 * ObserverModule: módulo raíz del patrón Observer.
 *
 * Este es el módulo que los compañeros deben importar en el AppModule principal:
 *
 *   import { ObserverModule } from './observer/observer.module';
 *
 *   @Module({
 *     imports: [ObserverModule, SingletonModule, AdapterModule],
 *   })
 *   export class AppModule {}
 *
 * Exporta AlertsModule para que otros módulos puedan usar AlertsService
 * o TankLevelSubject directamente si lo necesitan.
 */
@Module({
  imports: [
    AlertsModule,   // Toda la lógica del Observer
  ],
  exports: [AlertsModule],
})
export class ObserverModule {}
