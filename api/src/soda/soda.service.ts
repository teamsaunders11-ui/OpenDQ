import { Injectable } from '@nestjs/common';
import { RuleEntity } from '../common/models';
import { exec } from 'child_process';
import { writeFileSync } from 'fs';
import * as yaml from 'js-yaml';

export interface ScanResult {
  check: string;
  outcome: string;
  message?: string;
}

@Injectable()
export class SodaService {
  writeSodaYaml(rules: RuleEntity[], filePath: string) {
    // Convert rules to Soda YAML format (simplified example)
    const checks = rules.map(rule => ({
      [rule.name]: rule.columns?.map(col => col.name) || [],
    }));
    const sodaYaml = yaml.dump({ checks });
    writeFileSync(filePath, sodaYaml, 'utf8');
  }

  runSodaScan(filePath: string): Promise<ScanResult[]> {
    return new Promise((resolve, reject) => {
      // Run soda scan in the soda-core container
      exec(`docker exec opendq-soda soda scan ${filePath} --format json`, (error, stdout, stderr) => {
        if (error) return reject(error);
        try {
          const result = JSON.parse(stdout);
          // Map result to ScanResult[]
          const scanResults: ScanResult[] = (result.checks || []).map((check: any) => ({
            check: check.name,
            outcome: check.outcome,
            message: check.message,
          }));
          resolve(scanResults);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}
