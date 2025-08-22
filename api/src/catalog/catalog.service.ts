import { Injectable, Logger } from '@nestjs/common';
// Removed AddToCatalogDto
import axios from 'axios';
import { ATLAS_BASE_URL, ATLAS_USER, ATLAS_PASS } from './atlas.config';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);


  /**
   * TODO: Integrate with Atlas API to register table metadata
   */
  async registerTable(dto: { connectionId: string; tables: string[] }) {
    // Try to find or create the Database entity in Atlas
    const dbName = dto.connectionId; // Use connectionId as db name for now
    const dbQualifiedName = `${dbName}@cluster`;
    let dbGuid: string | null = null;
    // 1. Try to find the Database entity by qualifiedName
    try {
      const searchRes = await axios.get(`${ATLAS_BASE_URL}/v2/search/basic`, {
        params: {
          typeName: 'Database',
          excludeDeletedEntities: true,
          attrName: 'qualifiedName',
          attrValue: dbQualifiedName,
        },
        auth: { username: ATLAS_USER, password: ATLAS_PASS },
      });
      if (searchRes.data.entities && searchRes.data.entities.length > 0) {
        dbGuid = searchRes.data.entities[0].guid;
      }
    } catch (e) {
      this.logger.warn('Atlas DB search failed, will try to create.');
    }
    // 2. If not found, create the Database entity as 'hive_db'
    if (!dbGuid) {
      const dbEntity = {
        entities: [
          {
            typeName: 'hive_db',
            attributes: {
              name: dbName,
              qualifiedName: dbQualifiedName,
              clusterName: 'cluster',
              // location: `/tmp/${dbName}`, // optional, can be included if desired
              // parameters, ownerType, managedLocation are also optional
            },
          },
        ],
      };
      try {
        const createRes = await axios.post(
          `${ATLAS_BASE_URL}/v2/entity/bulk`,
          dbEntity,
          { auth: { username: ATLAS_USER, password: ATLAS_PASS } }
        );
        dbGuid = createRes.data.guidAssignments
          ? Object.values(createRes.data.guidAssignments)[0] as string
          : null;
      } catch (e: any) {
        this.logger.error('Atlas DB create failed', e?.response?.data || e.message);
        return { status: 'error', error: e?.response?.data || e.message };
      }
    }
    // 3. Register each table using the found/created dbGuid
    if (!dbGuid) {
      this.logger.error('No dbGuid found, cannot register tables. Database creation may have failed.');
      return { status: 'error', error: 'No dbGuid found. Database creation failed or not found.' };
    }
    this.logger.log(`Registering tables with dbGuid: ${dbGuid}`);
    const results: Array<{ table: string; status: string; data?: any; error?: any }> = [];
    for (const tableName of dto.tables) {
      // Minimal storage descriptor entity (sd) required by Atlas for hive_table
      const tableGuid = `-200${Math.floor(Math.random() * 1000000)}`; // temp negative GUID for table
      const sdGuid = `-100${Math.floor(Math.random() * 1000000)}`; // temp negative GUID for sd
      const entity = {
        entities: [
          {
            typeName: 'hive_table',
            guid: tableGuid,
            attributes: {
              name: tableName,
              qualifiedName: `${dto.connectionId}.${tableName}@cluster`,
              db: {
                guid: dbGuid,
                typeName: 'hive_db',
              },
              sd: {
                guid: sdGuid,
                typeName: 'hive_storagedesc',
              },
            },
          },
          {
            typeName: 'hive_storagedesc',
            guid: sdGuid,
            attributes: {
              qualifiedName: `${dto.connectionId}.${tableName}.sd@cluster`,
              location: `/tmp/${dto.connectionId}/${tableName}`,
              inputFormat: 'org.apache.hadoop.mapred.TextInputFormat',
              outputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
              compressed: false,
              storedAsSubDirectories: false,
              table: {
                guid: tableGuid,
                typeName: 'hive_table',
              },
            },
          },
        ],
      };
      try {
        const res = await axios.post(
          `${ATLAS_BASE_URL}/v2/entity/bulk`,
          entity,
          {
            auth: { username: ATLAS_USER, password: ATLAS_PASS },
          },
        );
        results.push({ table: tableName, status: 'success', data: res.data });
      } catch (error: any) {
        this.logger.error('Atlas registerTable error', error?.response?.data || error.message);
        results.push({ table: tableName, status: 'error', error: error?.response?.data || error.message });
      }
    }
    return { results };
  }

  /**
   * TODO: Integrate with Atlas API to fetch real lineage
   */
  async getLineage(tableName: string) {
    try {
      const res = await axios.get(
        `${ATLAS_BASE_URL}/v2/lineage/${encodeURIComponent(tableName)}`,
        {
          auth: { username: ATLAS_USER, password: ATLAS_PASS },
        },
      );
      return { status: 'success', data: res.data };
    } catch (error: any) {
      this.logger.error('Atlas getLineage error', error?.response?.data || error.message);
      return {
        status: 'error',
        error: error?.response?.data || error.message,
      };
    }
  }
}
