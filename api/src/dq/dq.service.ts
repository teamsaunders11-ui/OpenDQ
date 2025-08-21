import { Injectable } from '@nestjs/common';
import { RunStaticScanDto } from './dto/run-static-scan.dto';
import { RunDynamicScanDto } from './dto/run-dynamic-scan.dto';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import * as yaml from 'js-yaml';
import * as path from 'path';

@Injectable()
export class DqService {
  async runStaticScan(dto: RunStaticScanDto): Promise<any> {
    const { dataFile, checksFile } = dto;
  const command = `docker exec opendq-soda soda scan -d postgres /data/${checksFile} -c /data/soda_postgres_config.yml`;
    return this.execSodaCommand(command);
  }

  async runDynamicScan(dto: RunDynamicScanDto): Promise<any> {
    // Write temp checks YAML file to the same host path as integration test
    const checksFileName = `tmp_checks_${Date.now()}.yml`;
    const hostChecksDir = path.resolve(__dirname, '../../../infra/soda');
    const hostChecksPath = path.join(hostChecksDir, checksFileName);
    const containerChecksPath = `/data/${checksFileName}`;
    await fs.mkdir(hostChecksDir, { recursive: true });
    await fs.writeFile(hostChecksPath, dto.checks);
  const command = `docker exec opendq-soda soda scan -d postgres ${containerChecksPath} -c /data/soda_postgres_config.yml`;
    const result = await this.execSodaCommand(command);
    // Debug: log the result to help diagnose missing status
    console.log('Soda scan result:', JSON.stringify(result, null, 2));
    // Parse status from raw output if needed
    let status = 'unknown';
    let score = null;
    if (result && result.raw) {
      // Look for PASSED/FAILED in the output
      const failedMatch = result.raw.match(/(\d+\/\d+) check FAILED/i);
      const passedMatch = result.raw.match(/(\d+\/\d+) check PASSED/i);
      if (failedMatch) {
        status = 'FAILED';
      } else if (passedMatch) {
        status = 'PASSED';
      }
      // Optionally, extract score or other info here
    }
    // Clean up temp file
    await fs.unlink(hostChecksPath);
    // Return a structure similar to Soda's normal output
    return {
      checks: [
        {
          outcome: status,
          score: score,
        },
      ],
      raw: result.raw,
    };
  }

  private execSodaCommand(command: string): Promise<any> {
    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          // Log both stdout and stderr for debugging
          console.error('Soda scan error:', error.message);
          console.error('STDERR:', stderr);
          console.error('STDOUT:', stdout);
          // Even if error, try to parse stdout for results
        }
        try {
          const parsed = yaml.load(stdout);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: stdout });
        }
      });
    });
  }
}
