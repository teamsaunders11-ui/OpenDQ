export class RunDynamicScanDto {
  readonly data?: string; // CSV content as string (optional for db scans)
  readonly checks: string; // YAML checks as string
}
