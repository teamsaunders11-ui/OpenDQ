import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { AddToCatalogDto } from './dto/add-to-catalog.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}


  /**
   * TODO: Integrate with Atlas API to register table metadata
   */

  @Post('register')
  async registerTable(@Body() body: { connectionId: string, tables: string[] }) {
    return this.catalogService.registerTable(body.connectionId, body.tables);
  }

  /**
   * TODO: Integrate with Atlas API to fetch real lineage
   */
  @Get('lineage/:table')
  async getLineage(@Param('table') table: string) {
    return this.catalogService.getLineage(table);
  }
}
