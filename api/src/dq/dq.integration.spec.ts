import { Client } from 'pg';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Soda/Postgres Integration', () => {
  const tableName = 'soda_test_table';
  const testData = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 40 },
    { id: 4, name: null, age: 35 },
    { id: 5, name: 'Dave', age: null },
  ];
  const checksYml = `checks for ${tableName}:
  - row_count > 0
  - missing_count(id) = 0
  - missing_count(name) = 0
  - missing_count(age) = 0
`;
  // Always use the real infra/soda directory in the project root, so Docker can see the file
  // This works regardless of where the test is run from
  const projectRoot = path.resolve(__dirname, '../../..');
  const checksDir = path.join(projectRoot, 'infra', 'soda');
  const checksPath = path.join(checksDir, 'checks_pg.yml');
  const sodaConfigPath = path.join(checksDir, 'soda_postgres_config.yml');

  let client: Client;

  beforeAll(async () => {
    client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'postgres',
    });
    await client.connect();
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (id INT, name TEXT, age INT)`,
    );
    await client.query(`TRUNCATE TABLE ${tableName}`);
    for (const row of testData) {
      await client.query(
        `INSERT INTO ${tableName} (id, name, age) VALUES ($1, $2, $3)`,
        [row.id, row.name, row.age],
      );
    }
    await fs.mkdir(checksDir, { recursive: true });
    await fs.writeFile(checksPath, checksYml);
    // (Logging removed)
  });

  afterAll(async () => {
    await client.query(`DROP TABLE IF EXISTS ${tableName}`);
    await client.end();
    await fs.unlink(checksPath);
  });

  it('runs Soda scan on Postgres test table', async () => {
    jest.setTimeout(20000); // 20 seconds
    const command = `docker exec opendq-soda soda scan -d postgres /data/checks_pg.yml -c /data/soda_postgres_config.yml`;
    const execPromise = () =>
      new Promise<{ stdout: string; stderr: string }>((resolve) => {
        exec(command, (error, stdout, stderr) => {
          // No extra error logging for expected failures
          resolve({ stdout, stderr });
        });
      });
    const { stdout } = await execPromise();

    // Print a summary of Soda checks that passed and failed
    const passed: string[] = [];
    const failed: string[] = [];
    const lines = stdout.split('\n');
    for (const line of lines) {
      const match = line.match(
        /\s*(\w+_count\(?.*\)? =? ?\d*) \[(PASSED|FAILED)\]/,
      );
      if (match) {
        if (match[2] === 'PASSED') passed.push(match[1]);
        else if (match[2] === 'FAILED') failed.push(match[1]);
      }
    }
    console.log('Soda checks PASSED:', passed);
    console.log('Soda checks FAILED:', failed);

    // Expect 2 passes and 2 failures as per the current test data
    expect(stdout).toContain('row_count > 0 [PASSED]');
    expect(stdout).toContain('missing_count(id) = 0 [PASSED]');
    expect(stdout).toContain('missing_count(name) = 0 [FAILED]');
    expect(stdout).toContain('missing_count(age) = 0 [FAILED]');
  }, 20000);
});
