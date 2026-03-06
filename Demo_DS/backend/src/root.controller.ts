import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  root() {
    return {
      service: 'Lecturas y Alertas de Tanques API',
      status: 'ok',
      modules: ['singleton', 'observer'],
      endpoints: {
        singleton: [
          'GET /api/singleton/config',
          'PATCH /api/singleton/config',
          'POST /api/singleton/config/reset',
        ],
        observer: [
          'POST /api/alerts/evaluate',
          'GET /api/alerts',
          'GET /api/alerts/active',
          'GET /api/alerts/:id',
          'PATCH /api/alerts/:id/resolve',
          'GET /api/alerts/tank/:tankId',
          'POST /api/setup/tanks',
          'GET /api/setup/tanks',
          'POST /api/setup/thresholds',
          'GET /api/setup/thresholds/:tankId',
        ],
      },
    };
  }
}
