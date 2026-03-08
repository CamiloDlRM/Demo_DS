import { IsNumber, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SimulateReadingDto {
  @IsNumber()
  @Type(() => Number)
  tankId!: number;

  @IsIn(['ultrasonic', 'pressure'])
  sensorType!: 'ultrasonic' | 'pressure';

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  mockValue!: number;
}