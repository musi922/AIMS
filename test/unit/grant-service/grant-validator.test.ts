import { beforeAll, describe, expect, it } from '@jest/globals';
import cds from '@sap/cds';

const test = cds.test('serve', '--with-mocks', '--in-memory?').in(process.cwd());

const SVC = '/odata/v4/grant-master-data';
const AUTH = { auth: { password: '', username: 'alice' } };

const grantFields = {
    grantNumber: 'TEST-01',
    grantName: 'Foerderung',
    amountMax: 50000.0,
    overheadPercentage: 10.0,
    dueTo: '2026-12-31',
    validTo: '2028-12-31',
    active: true,
    sponsor_code: 'DFG',
    status_code: 'DRAFT',
};

async function activate(grantId: string): Promise<{ body?: unknown; status: number }> {
    try {
        const res = await test.POST(
            `${SVC}/GrantsMasterData(ID=${grantId},IsActiveEntity=false)/GrantMasterDataService.draftActivate`,
            {},
            AUTH
        );
        return { status: res.status };
    } catch (err) {
        const response = (err as { response?: { data?: unknown; status?: number } }).response;
        return { body: response?.data, status: response?.status ?? -1 };
    }
}

describe('GrantsMasterData validation logic', () => {
    beforeAll(async () => {
        await test;
    });

    it('rejects saving (activating) a grant if percentage validations fail', async () => {
        const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const grantId = grant.ID;
        
        await test.PATCH(`${SVC}/GrantsMasterData(ID=${grantId},IsActiveEntity=false)`, { ...grantFields, overheadPercentage: 150.0 }, AUTH);
        
        const { body, status } = await activate(grantId);
        expect(status).toBe(400);
        expect((body as { error?: { message?: string } })?.error?.message).toMatch(/between 0 and 100/);
    });
});
