import { beforeAll, describe, expect, it } from '@jest/globals';
import cds from '@sap/cds';

const test = cds.test('serve', '--with-mocks', '--in-memory?').in(process.cwd());

describe('GrantMasterDataService', () => {
    beforeAll(async () => {
        await test;
    });

    it('should expose a handler with an init method', async () => {
        const srv = await cds.connect.to('GrantMasterDataService');
        expect(srv).toBeDefined();
    });
});
