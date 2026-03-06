import { IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para POST /setup/thresholds
 * Crea o actualiza los umbrales de alerta de un tanque.
 */
export class CreateThresholdDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  tankId!: number;

  /** Litros mínimos antes de generar NIVEL_BAJO */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minLevel!: number;

  /** Litros mínimos antes de generar NIVEL_CRITICO */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  criticalMin!: number;

  /** Litros máximos antes de generar NIVEL_ALTO */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxLevel!: number;

  /** Caída en L/min que indica POSIBLE_FUGA */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leakThreshold!: number;
}
