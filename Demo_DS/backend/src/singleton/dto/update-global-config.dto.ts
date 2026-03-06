import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateGlobalConfigDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  sampleRateSeconds?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  alertThresholdPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(-10)
  @Max(10)
  calibrationOffset?: number;
}
