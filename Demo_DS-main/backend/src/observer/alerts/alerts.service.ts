import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TankLevelSubject } from '../subjects/tank-level.subject';
import { EvaluateReadingDto } from './dto/evaluate-reading.dto';
import { FilterAlertDto } from './dto/filter-alert.dto';
import { CreateThresholdDto } from './dto/create-threshold.dto';
import { CreateTankDto } from './dto/create-tank.dto';
import { TankAlertEvent } from '../interfaces/tank-alert-event.interface';

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    /**
     * El TankLevelSubject es el Sujeto del patrón Observer.
     * El servicio lo usa como punto de entrada para evaluar lecturas;
     * el subject se encarga de notificar a todos sus observadores.
     */
    private readonly tankLevelSubject: TankLevelSubject,
  ) {}

  // ── Endpoint principal: evaluar lectura y disparar el Observer ────────────

  /**
   * POST /alerts/evaluate
   * Recibe una lectura de sensor, recupera los umbrales del tanque desde BD,
   * y delega en el TankLevelSubject (patrón Observer) la evaluación y notificación.
   */
  async evaluate(dto: EvaluateReadingDto): Promise<TankAlertEvent[]> {
    const thresholdRecord = await this.prisma.tankThreshold.findUnique({
      where: { tankId: dto.tankId },
      include: { tank: true },
    });

    if (!thresholdRecord) {
      throw new NotFoundException(
        `No hay umbrales configurados para el tanque ID ${dto.tankId}. ` +
        `Crea primero los umbrales con POST /setup/thresholds.`,
      );
    }

    // ── Punto de entrada al patrón Observer ──────────────────────────────────
    // El TankLevelSubject evalúa la lectura y notifica a sus observadores.
    return this.tankLevelSubject.evaluateReading({
      tankId:                 dto.tankId,
      tankName:               thresholdRecord.tank.name,
      levelLiters:            dto.levelLiters,
      percentage:             dto.percentage,
      previousLevelLiters:    dto.previousLevelLiters,
      minutesSinceLastReading: dto.minutesSinceLastReading,
      thresholds: {
        minLevel:        thresholdRecord.minLevel,
        criticalMin:     thresholdRecord.criticalMin,
        maxLevel:        thresholdRecord.maxLevel,
        capacityLiters:  thresholdRecord.tank.capacityLiters,
        leakThreshold:   thresholdRecord.leakThreshold,
      },
    });
  }

  // ── Consulta de alertas ───────────────────────────────────────────────────

  /** GET /alerts – Lista con filtros opcionales */
  async findAll(filters: FilterAlertDto) {
    return this.prisma.alert.findMany({
      where: {
        ...(filters.tankId !== undefined  && { tankId:    filters.tankId }),
        ...(filters.alertType             && { alertType: filters.alertType }),
        ...(filters.resolved !== undefined && { resolved:  filters.resolved }),
      },
      orderBy: { createdAt: 'desc' },
      include: { tank: { select: { name: true } } },
    });
  }

  /** GET /alerts/:id – Detalle de una alerta */
  async findOne(id: number) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: { tank: { select: { name: true, location: true } } },
    });
    if (!alert) throw new NotFoundException(`Alerta con ID ${id} no encontrada.`);
    return alert;
  }

  /** PATCH /alerts/:id/resolve – Marcar alerta como resuelta */
  async resolve(id: number) {
    await this.findOne(id); // valida existencia; lanza NotFoundException si no existe
    return this.prisma.alert.update({
      where: { id },
      data:  { resolved: true, resolvedAt: new Date() },
    });
  }

  /** GET /alerts/tank/:tankId – Historial de alertas de un tanque */
  async findByTank(tankId: number) {
    return this.prisma.alert.findMany({
      where:   { tankId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** GET /alerts/active – Solo alertas no resueltas */
  async findActive() {
    return this.prisma.alert.findMany({
      where:   { resolved: false },
      orderBy: { createdAt: 'desc' },
      include: { tank: { select: { name: true } } },
    });
  }

  // ── Setup: gestión de tanques y umbrales (para pruebas sin módulos externos) ──

  /** POST /setup/tanks */
  async createTank(dto: CreateTankDto) {
    return this.prisma.tank.create({ data: dto });
  }

  /** GET /setup/tanks */
  async listTanks() {
    return this.prisma.tank.findMany({
      include: { threshold: true },
      orderBy: { id: 'asc' },
    });
  }

  /** POST /setup/thresholds */
  async upsertThreshold(dto: CreateThresholdDto) {
    const tank = await this.prisma.tank.findUnique({ where: { id: dto.tankId } });
    if (!tank) {
      throw new NotFoundException(`Tanque ID ${dto.tankId} no existe. Créalo primero con POST /setup/tanks.`);
    }
    if (dto.criticalMin >= dto.minLevel) {
      throw new BadRequestException('criticalMin debe ser menor que minLevel.');
    }
    if (dto.maxLevel >= tank.capacityLiters) {
      throw new BadRequestException(`maxLevel debe ser menor que la capacidad del tanque (${tank.capacityLiters}L).`);
    }

    return this.prisma.tankThreshold.upsert({
      where:  { tankId: dto.tankId },
      update: {
        minLevel:      dto.minLevel,
        criticalMin:   dto.criticalMin,
        maxLevel:      dto.maxLevel,
        leakThreshold: dto.leakThreshold,
      },
      create: {
        tankId:        dto.tankId,
        minLevel:      dto.minLevel,
        criticalMin:   dto.criticalMin,
        maxLevel:      dto.maxLevel,
        leakThreshold: dto.leakThreshold,
      },
    });
  }

  /** GET /setup/thresholds/:tankId */
  async getThreshold(tankId: number) {
    const threshold = await this.prisma.tankThreshold.findUnique({ where: { tankId } });
    if (!threshold) throw new NotFoundException(`No hay umbrales para el tanque ID ${tankId}.`);
    return threshold;
  }
}
