
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetadataController } from './metadata/metadata.controller';
import { AtlasService } from './atlas/atlas.service';


@Module({
  imports: [],
  controllers: [AppController, MetadataController],
  providers: [AppService, AtlasService],
})
export class AppModule {}
