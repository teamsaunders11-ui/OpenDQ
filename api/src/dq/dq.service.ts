import { Injectable } from '@nestjs/common';
import { RunStaticScanDto } from './dto/run-static-scan.dto';
import { RunDynamicScanDto } from './dto/run-dynamic-scan.dto';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import * as yaml from 'js-yaml';

@Injectable()
export class DqService {
  async runStaticScan(dto: RunStaticScanDto): Promise<any> {
    const { dataFile, checksFile } = dto;
  const command = `docker exec opendq-soda soda scan /data/${dataFile} /data/${checksFile}`;
    return this.execSodaCommand(command);
  }

  async runDynamicScan(dto: RunDynamicScanDto): Promise<any> {
    // Write temp files
    const dataPath = `/data/tmp_data_${Date.now()}.csv`;
    const checksPath = `/data/tmp_checks_${Date.now()}.yml`;
    await fs.writeFile(`./infra/soda${dataPath.replace('/data','')}`, dto.data);
    await fs.writeFile(`./infra/soda${checksPath.replace('/data','')}`, dto.checks);
  const command = `docker exec opendq-soda soda scan ${dataPath} ${checksPath}`;
    const result = await this.execSodaCommand(command);
    // Clean up temp files
    await fs.unlink(`./infra/soda${dataPath.replace('/data','')}`);
    await fs.unlink(`./infra/soda${checksPath.replace('/data','')}`);
    return result;
  }

  private execSodaCommand(command: string): Promise<any> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
        } else {
          try {
            const parsed = yaml.load(stdout);
            resolve(parsed);
          } catch (e) {
            resolve({ raw: stdout });
          }
        }
      });
    });
  }
}
