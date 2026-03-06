import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UpdateGlobalConfigDto } from './dto/update-global-config.dto';
import { SingletonService } from './singleton.service';

@Controller('singleton/config')
export class SingletonController {
  constructor(private readonly singletonService: SingletonService) {}

  @Get()
  getConfig() {
    return this.singletonService.getOrCreateGlobalConfig();
  }

  @Patch()
  updateConfig(@Body() payload: UpdateGlobalConfigDto) {
    return this.singletonService.updateGlobalConfig(payload);
  }

  @Post('reset')
  resetConfig() {
    return this.singletonService.resetGlobalConfig();
  }
}
