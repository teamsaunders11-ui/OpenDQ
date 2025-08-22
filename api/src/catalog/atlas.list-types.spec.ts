import axios from 'axios';
import { ATLAS_BASE_URL, ATLAS_USER, ATLAS_PASS } from './atlas.config';

describe('Atlas Type System', () => {
  it('should fetch all entity type definitions', async () => {
    const res = await axios.get(
      `${ATLAS_BASE_URL}/v2/types/typedefs`,
      { auth: { username: ATLAS_USER, password: ATLAS_PASS } }
    );
    // Print all entity type names for inspection
    const entityDefs = res.data.entityDefs || [];
    // eslint-disable-next-line no-console
    console.log('Entity type names:', entityDefs.map((d: any) => d.name));
    expect(res.status).toBe(200);
    expect(Array.isArray(entityDefs)).toBe(true);
  });
});
