import { IsString, IsNumber, IsOptional, IsPositive, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para POST /setup/tanks
 * Permite crear tanques de prueba sin necesitar el módulo Singleton/Adapter.
 * Los compañeros pueden reemplazar este endpoint con su implementación.
 */
export class CreateTankDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  capacityLiters!: number;

  @IsString()
  @IsOptional()
  geometry?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
