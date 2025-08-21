import { Body, Controller, Post } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { AddToCatalogDto } from './dto/add-to-catalog.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  async addToCatalog(@Body() body: AddToCatalogDto) {
    return this.catalogService.addToCatalog(body);
  }
}
