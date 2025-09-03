import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AtlasService {
  /**
   * Get an entity by type and qualifiedName attribute
   */
  async getEntityByQualifiedName(typeName: string, qualifiedName: string) {
    try {
      const { data } = await this.atlas.get(`/entity/bulk/uniqueAttribute/type/${typeName}`, {
        params: { attr: `qualifiedName:${qualifiedName}` },
      });
      // Defensive: treat data as any
      const entityData: any = data;
      if (entityData && Array.isArray(entityData.entities) && entityData.entities.length > 0) {
        return entityData.entities[0];
      }
      if (entityData && typeof entityData === 'object' && 'guid' in entityData) {
        return entityData;
      }
      return null;
    } catch (err) {
      // 404 means not found
      if (err.response && err.response.status === 404) return null;
      throw err;
    }
  }

  /**
   * Delete an entity by type and guid
   */
  async deleteEntityByGuid(typeName: string, guid: string) {
    try {
      await this.atlas.delete(`/entity/guid/${guid}`);
    } catch (err) {
      // 404 means already deleted
      if (err.response && err.response.status === 404) return;
      throw err;
    }
  }
  private readonly atlas;

  constructor() {
    this.atlas = axios.create({
      baseURL: process.env.ATLAS_BASE_URL || 'http://atlas:21000/api/atlas/v2',
      auth: {
        username: process.env.ATLAS_USER || 'admin',
        password: process.env.ATLAS_PASSWORD || 'admin',
      },
    });
  }

  async createEntity(typeName: string, attributes: object) {
    const entity = {
      entities: [
        {
          typeName,
          attributes,
        },
      ],
    };
    const { data } = await this.atlas.post('/entity/bulk', entity);
    return data;
  }

  async getEntityByName(typeName: string, name: string) {
    const { data } = await this.atlas.get(`/entity/bulk/uniqueAttribute/type/${typeName}`, {
      params: { attr: `name:${name}` },
    });
    return data;
  }

  async attachRules(entityId: string, rules: object[]) {
    // Example: add rules as a classification or custom attribute
    const { data } = await this.atlas.put(`/entity/guid/${entityId}`, {
      classifications: rules,
    });
    return data;
  }
  // Fetch all entities of a given type, with optional search
  async getEntitiesByType(typeName: string, search?: string) {
    const params: any = {
      typeName,
      limit: 1000,
    };
    if (search) {
      params.query = search;
    }
  const { data } = await this.atlas.get('/search/basic', { params });
  const entities = (data as { entities?: any[] })?.entities;
  return entities || [];
  }

  /**
   * Fetch all assets (Database, Table, Column, Rule) from Atlas, flatten and filter as needed
   */
  async getAllAssets(typeFilter?: string, search?: string): Promise<any[]> {
    const types = ['Database', 'Table', 'Column', 'Rule'];
    const typeList = typeFilter && types.includes(typeFilter) ? [typeFilter] : types;
    let allAssets: any[] = [];
    for (const t of typeList) {
      const entities = await this.getEntitiesByType(t, search);
      for (const entity of entities) {
        const attrs = entity.attributes || {};
        let parentId = null;
        if (t === 'Table' && attrs.database) parentId = attrs.database?.id || attrs.database;
        if (t === 'Column' && attrs.table) parentId = attrs.table?.id || attrs.table;
        if (t === 'Rule') {
          if (attrs.table) parentId = attrs.table?.id || attrs.table;
          else if (attrs.column) parentId = attrs.column?.id || attrs.column;
        }
        allAssets.push({
          id: entity.guid || entity.id,
          name: attrs.name,
          type: t,
          score: attrs.score ?? null,
          parentId,
        });
      }
    }
    return allAssets;
  }
}
