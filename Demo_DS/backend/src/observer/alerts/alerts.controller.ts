import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { EvaluateReadingDto } from './dto/evaluate-reading.dto';
import { FilterAlertDto } from './dto/filter-alert.dto';
import { CreateThresholdDto } from './dto/create-threshold.dto';
import { CreateTankDto } from './dto/create-tank.dto';

/**
 * AlertsController – Expone los endpoints REST del módulo Observer.
 *
 * Rutas de alertas (patrón Observer):
 *   POST   /alerts/evaluate        → Dispara el Observer con una lectura nueva
 *   GET    /alerts/active          → Alertas no resueltas
 *   GET    /alerts/tank/:tankId    → Historial de un tanque
 *   GET    /alerts                 → Listado con filtros
 *   GET    /alerts/:id             → Detalle de una alerta
 *   PATCH  /alerts/:id/resolve     → Marcar como resuelta
 *
 * Rutas de setup (para probar sin los módulos de compañeros):
 *   POST   /setup/tanks            → Crear tanque
 *   GET    /setup/tanks            → Listar tanques
 *   POST   /setup/thresholds       → Crear/actualizar umbrales
 *   GET    /setup/thresholds/:id   → Obtener umbrales de un tanque
 */
@Controller()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  // ── ALERTAS ───────────────────────────────────────────────────────────────

  /**
   * POST /alerts/evaluate
   * Punto de entrada al patrón Observer.
   * Evalúa una lectura de sensor y retorna las alertas generadas.
   */
  @Post('alerts/evaluate')
  evaluate(@Body() dto: EvaluateReadingDto) {
    return this.alertsService.evaluate(dto);
  }

  /**
   * GET /alerts/active
   * Lista solo las alertas activas (resolved = false).
   * IMPORTANTE: debe ir ANTES de /alerts/:id para que NestJS no lo trate como param.
   */
  @Get('alerts/active')
  findActive() {
    return this.alertsService.findActive();
  }

  /**
   * GET /alerts/tank/:tankId
   * Historial completo de alertas de un tanque específico.
   */
  @Get('alerts/tank/:tankId')
  findByTank(@Param('tankId', ParseIntPipe) tankId: number) {
    return this.alertsService.findByTank(tankId);
  }

  /**
   * GET /alerts?tankId=1&alertType=NIVEL_BAJO&resolved=false
   * Lista todas las alertas con filtros opcionales.
   */
  @Get('alerts')
  findAll(@Query() filters: FilterAlertDto) {
    return this.alertsService.findAll(filters);
  }

  /**
   * GET /alerts/:id
   * Detalle de una alerta por ID.
   */
  @Get('alerts/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findOne(id);
  }

  /**
   * PATCH /alerts/:id/resolve
   * Marca una alerta como resuelta y registra la fecha de resolución.
   */
  @Patch('alerts/:id/resolve')
  resolve(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.resolve(id);
  }

  // ── SETUP (configuración de tanques y umbrales para pruebas) ─────────────

  /** POST /setup/tanks */
  @Post('setup/tanks')
  createTank(@Body() dto: CreateTankDto) {
    return this.alertsService.createTank(dto);
  }

  /** GET /setup/tanks */
  @Get('setup/tanks')
  listTanks() {
    return this.alertsService.listTanks();
  }

  /** POST /setup/thresholds */
  @Post('setup/thresholds')
  upsertThreshold(@Body() dto: CreateThresholdDto) {
    return this.alertsService.upsertThreshold(dto);
  }

  /** GET /setup/thresholds/:tankId */
  @Get('setup/thresholds/:tankId')
  getThreshold(@Param('tankId', ParseIntPipe) tankId: number) {
    return this.alertsService.getThreshold(tankId);
  }
}
