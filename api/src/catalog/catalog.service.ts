import { Injectable, Logger } from '@nestjs/common';
import { AddToCatalogDto } from './dto/add-to-catalog.dto';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  async addToCatalog(dto: AddToCatalogDto) {
    // Simulate sending metadata to Apache Atlas (log for now)
    this.logger.log(`Simulating sending to Apache Atlas: ${JSON.stringify(dto)}`);
    return { message: 'Metadata sent to Apache Atlas (simulated)', data: dto };
  }
}
