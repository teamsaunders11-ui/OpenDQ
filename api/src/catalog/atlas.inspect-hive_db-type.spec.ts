import axios from 'axios';
import { ATLAS_BASE_URL, ATLAS_USER, ATLAS_PASS } from './atlas.config';

describe('Atlas Type System', () => {
  it('should fetch hive_db entity type definition', async () => {
    const res = await axios.get(
      `${ATLAS_BASE_URL}/v2/types/entitydef/name/hive_db`,
      { auth: { username: ATLAS_USER, password: ATLAS_PASS } }
    );
    // Print the attributes for inspection
    // eslint-disable-next-line no-console
    console.log('hive_db entity type definition:', JSON.stringify(res.data, null, 2));
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('attributeDefs');
  });
});
