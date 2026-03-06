import { IsNumber, IsOptional, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para POST /alerts/evaluate
 * Representa los datos de una lectura de sensor ultrasónico.
 * El Observer evaluará estos datos contra los umbrales del tanque.
 */
export class EvaluateReadingDto {
  /** ID del tanque al que pertenece esta lectura */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  tankId!: number;

  /** Volumen actual del líquido en litros */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  levelLiters!: number;

  /** Porcentaje de llenado del tanque (0–100) */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  percentage!: number;

  /** Temperatura del líquido en grados Celsius (dato de contexto) */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  temperatureC?: number;

  /** Distancia sensor→superficie en cm (dato de contexto) */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  distanceCm?: number;

  /**
   * Nivel previo en litros para calcular tasa de caída.
   * Necesario para detección de posible fuga.
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  previousLevelLiters?: number;

  /**
   * Minutos transcurridos desde la lectura anterior.
   * Necesario para calcular la tasa de caída (L/min).
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minutesSinceLastReading?: number;
}
