import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateGlobalConfigDto } from './dto/update-global-config.dto';

const SINGLETON_CONFIG_ID = 1;

@Injectable()
export class SingletonService {
  constructor(private readonly prisma: PrismaService) {}

  private defaultConfig() {
    return {
      id: SINGLETON_CONFIG_ID,
      siteName: 'Tanques Planta Norte',
      sampleRateSeconds: 10,
      alertThresholdPercent: 80,
      calibrationOffset: 0,
    };
  }

  async getOrCreateGlobalConfig() {
    const found = await this.prisma.globalTankConfig.findUnique({
      where: { id: SINGLETON_CONFIG_ID },
    });

    if (found) {
      return found;
    }

    return this.prisma.globalTankConfig.create({
      data: this.defaultConfig(),
    });
  }

  async updateGlobalConfig(payload: UpdateGlobalConfigDto) {
    await this.getOrCreateGlobalConfig();

    return this.prisma.globalTankConfig.update({
      where: { id: SINGLETON_CONFIG_ID },
      data: payload,
    });
  }

  async resetGlobalConfig() {
    return this.prisma.globalTankConfig.upsert({
      where: { id: SINGLETON_CONFIG_ID },
      create: this.defaultConfig(),
      update: {
        siteName: 'Tanques Planta Norte',
        sampleRateSeconds: 10,
        alertThresholdPercent: 80,
        calibrationOffset: 0,
      },
    });
  }
}
