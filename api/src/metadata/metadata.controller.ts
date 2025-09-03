import { Body, Controller, Post } from '@nestjs/common';
import { AtlasService } from '../atlas/atlas.service';
import { Client } from 'pg';

import { Get, Query } from '@nestjs/common';

interface DbConnectionDto {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

@Controller('metadata')
export class MetadataController {
  constructor(private readonly atlas: AtlasService) {}

  /**
   * GET /metadata/assets
   * Returns a flat list of all assets (databases, tables, columns, rules) from Atlas.
   * Supports optional query params: type (filter by asset type), search (search by name)
   */
  @Get('assets')
  async getAssets(
    @Query('type') type?: string,
    @Query('search') search?: string
  ) {
    // Supported types for catalogged assets
    const types = ['rdbms_instance', 'rdbms_db', 'rdbms_table', 'rdbms_column'];
    const typeList = type && types.includes(type) ? [type] : types;
    let allAssets: any[] = [];

    for (const t of typeList) {
      const entities = await this.atlas.getEntitiesByType(t, search);
      for (const entity of entities) {
        // Flatten entity attributes
        const attrs = entity.attributes || {};
        let parentId = null;
        if (t === 'rdbms_table' && attrs.db) parentId = attrs.db?.id || attrs.db?.guid || attrs.db;
        if (t === 'rdbms_column' && attrs.table) parentId = attrs.table?.id || attrs.table?.guid || attrs.table;
        allAssets.push({
          id: entity.guid || entity.id,
          name: attrs.name,
          type: t,
          parentId,
        });
      }
    }
    return allAssets;
  }

  @Post('sync')
  async syncMetadata(@Body() db: DbConnectionDto) {
    console.log('[sync] Connecting to Postgres:', db.host, db.port, db.database, db.user);
    const client = new Client({
      host: db.host,
      port: db.port,
      user: db.user,
      password: db.password,
      database: db.database,
    });
    await client.connect();

    // rdbms_instance
    console.log('[sync] Creating rdbms_instance entity in Atlas:', db.host, db.port);
    const instanceQualifiedName = `${db.host}:${db.port}`;
    const instanceResp: any = await this.atlas.createEntity('rdbms_instance', {
      name: instanceQualifiedName,
      qualifiedName: instanceQualifiedName,
      rdbms_type: 'postgres'
    });
    console.log('[sync] Atlas rdbms_instance response:', JSON.stringify(instanceResp, null, 2));
    // Extract guid/id robustly
    let instanceGuid = null;
    if (instanceResp?.mutatedEntities?.CREATE && Array.isArray(instanceResp.mutatedEntities.CREATE) && instanceResp.mutatedEntities.CREATE.length > 0) {
      instanceGuid = instanceResp.mutatedEntities.CREATE[0].guid || instanceResp.mutatedEntities.CREATE[0].id;
    } else if (instanceResp?.guid || instanceResp?.id) {
      instanceGuid = instanceResp.guid || instanceResp.id;
    } else if (instanceResp?.guidAssignments && typeof instanceResp.guidAssignments === 'object') {
      // Use the first value in guidAssignments
      const values = Object.values(instanceResp.guidAssignments);
      if (values.length > 0) {
        instanceGuid = values[0];
      }
    }
    if (!instanceGuid) {
      throw new Error('Failed to extract guid/id from rdbms_instance creation response');
    }

    // rdbms_db
    console.log('[sync] Creating rdbms_db entity in Atlas:', db.database);
    const dbQualifiedName = `${db.database}@${db.host}:${db.port}`;
    const dbResp: any = await this.atlas.createEntity('rdbms_db', {
      name: db.database,
      qualifiedName: dbQualifiedName,
      instance: {
        guid: instanceGuid,
        typeName: 'rdbms_instance'
      }
    });
    console.log('[sync] Atlas rdbms_db response:', JSON.stringify(dbResp, null, 2));
    let dbGuid = null;
    if (dbResp?.mutatedEntities?.CREATE && Array.isArray(dbResp.mutatedEntities.CREATE) && dbResp.mutatedEntities.CREATE.length > 0) {
      dbGuid = dbResp.mutatedEntities.CREATE[0].guid || dbResp.mutatedEntities.CREATE[0].id;
    } else if (dbResp?.guid || dbResp?.id) {
      dbGuid = dbResp.guid || dbResp.id;
    } else if (dbResp?.guidAssignments && typeof dbResp.guidAssignments === 'object') {
      const values = Object.values(dbResp.guidAssignments);
      if (values.length > 0) {
        dbGuid = values[0];
      }
    }
    if (!dbGuid) {
      throw new Error('Failed to extract guid/id from rdbms_db creation response');
    }

    console.log('[sync] Fetching tables from Postgres...');
    const tablesRes = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    const tables = tablesRes.rows.map(row => row.table_name);
    console.log(`[sync] Found tables:`, tables);
    const summary = [];

    for (const table of tables) {
      console.log(`[sync] Processing table: ${table}`);
      // Fetch columns
      const columnsRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [table]);
      const columns = columnsRes.rows.map(row => row.column_name);
      console.log(`[sync] Columns for table ${table}:`, columns);
      // rdbms_table
      const tableQualifiedName = `${table}@${db.database}@${db.host}:${db.port}`;
      const tableResp: any = await this.atlas.createEntity('rdbms_table', {
        name: table,
        qualifiedName: tableQualifiedName,
        db: {
          guid: dbGuid,
          typeName: 'rdbms_db'
        }
      });
      console.log('[sync] Atlas rdbms_table response:', JSON.stringify(tableResp, null, 2));
      let tableGuid = null;
      if (tableResp?.mutatedEntities?.CREATE && Array.isArray(tableResp.mutatedEntities.CREATE) && tableResp.mutatedEntities.CREATE.length > 0) {
        tableGuid = tableResp.mutatedEntities.CREATE[0].guid || tableResp.mutatedEntities.CREATE[0].id;
      } else if (tableResp?.guid || tableResp?.id) {
        tableGuid = tableResp.guid || tableResp.id;
      }
      if (!tableGuid) {
        throw new Error('Failed to extract guid/id from rdbms_table creation response');
      }
      // rdbms_column
      for (const column of columns) {
        const columnQualifiedName = `${column}@${table}@${db.database}@${db.host}:${db.port}`;
        const columnResp: any = await this.atlas.createEntity('rdbms_column', {
          name: column,
          qualifiedName: columnQualifiedName,
          table: {
            guid: tableGuid,
            typeName: 'rdbms_table'
          }
        });
        console.log('[sync] Atlas rdbms_column response:', JSON.stringify(columnResp, null, 2));
      }
      summary.push({ table, columns });
    }
    await client.end();
    console.log('[sync] Finished onboarding. Returning summary.');
    return { tables: summary };
  }
}
