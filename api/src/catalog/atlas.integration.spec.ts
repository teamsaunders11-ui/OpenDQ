import axios from 'axios';
import { ATLAS_BASE_URL, ATLAS_USER, ATLAS_PASS } from './atlas.config';

describe('Atlas Integration', () => {
  it('should connect to Atlas and fetch version info', async () => {
    const res = await axios.get(`${ATLAS_BASE_URL}/admin/version`, {
      auth: { username: ATLAS_USER, password: ATLAS_PASS },
    });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('Version');
  });
});
