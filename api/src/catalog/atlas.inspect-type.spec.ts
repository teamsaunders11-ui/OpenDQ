import axios from 'axios';
import { ATLAS_BASE_URL, ATLAS_USER, ATLAS_PASS } from './atlas.config';

describe('Atlas Type System', () => {
  it('should fetch Database entity type definition', async () => {
    const res = await axios.get(
      `${ATLAS_BASE_URL}/v2/types/entitydef/name/Database`,
      { auth: { username: ATLAS_USER, password: ATLAS_PASS } }
    );
    // Print the attributes for inspection
    // eslint-disable-next-line no-console
    console.log('Database entity type definition:', JSON.stringify(res.data, null, 2));
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('attributeDefs');
  });
});
