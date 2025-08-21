import { Body, Controller, Post } from '@nestjs/common';
import { DqService } from './dq.service';
import { RunStaticScanDto } from './dto/run-static-scan.dto';
import { RunDynamicScanDto } from './dto/run-dynamic-scan.dto';

@Controller('dq')
export class DqController {
  constructor(private readonly dqService: DqService) {}

  @Post('static-scan')
  async runStaticScan(@Body() dto: RunStaticScanDto) {
    return this.dqService.runStaticScan(dto);
  }

  @Post('dynamic-scan')
  async runDynamicScan(@Body() dto: RunDynamicScanDto) {
    return this.dqService.runDynamicScan(dto);
  }
}
