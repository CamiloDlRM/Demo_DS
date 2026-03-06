import { IsOptional, IsString, IsBoolean, IsNumber, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO de filtros para GET /alerts
 * Todos los campos son opcionales para permitir combinaciones arbitrarias.
 */
export class FilterAlertDto {
  /** Filtrar por ID de tanque */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  tankId?: number;

  /** Filtrar por tipo de alerta (NIVEL_BAJO, NIVEL_CRITICO, etc.) */
  @IsOptional()
  @IsString()
  alertType?: string;

  /** Filtrar por estado: true = resueltas, false = activas */
  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  resolved?: boolean;
}
