import axios from 'axios';
import { ATLAS_BASE_URL, ATLAS_USER, ATLAS_PASS } from './atlas.config';

describe('Atlas Type System', () => {
  it('should fetch hive_table entity type definition', async () => {
    const res = await axios.get(`${ATLAS_BASE_URL}/v2/types/typedefs`, {
      auth: { username: ATLAS_USER, password: ATLAS_PASS },
    });
    const hiveTableType = res.data.entityDefs.find((t: any) => t.name === 'hive_table');
    // eslint-disable-next-line no-console
    console.log('hive_table entity type definition:', JSON.stringify(hiveTableType, null, 2));
    expect(hiveTableType).toBeDefined();
  });
});
