import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { SensorService } from './sensore-services';
import { SensorFactory } from './sensor-factory';
import { SimulateReadingDto } from './Simulate-reading';

@Controller('sensors')
export class SensorsController {
  constructor(
    private readonly sensorService: SensorService,
    private readonly sensorFactory: SensorFactory,
  ) {}

  @Post('simulate')
  async simulate(@Body() dto: SimulateReadingDto) {
    let adapter;

    switch (dto.sensorType) {
      case 'ultrasonic':
        adapter = this.sensorFactory.createUltrasonicAdapter(dto.tankId, dto.mockValue);
        break;
      case 'pressure':
        adapter = this.sensorFactory.createPressureAdapter(dto.tankId, dto.mockValue);
        break;
      default:
        throw new BadRequestException('Tipo de sensor no soportado');
    }

    return this.sensorService.processSensorReading(adapter);
  }
}