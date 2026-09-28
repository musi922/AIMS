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

const scopeBase = {
    businessDepartment_code: 'MB'
};

async function createGrantWithScope(scope: Record<string, unknown>): Promise<string> {
    const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
    const grantId = grant.ID;
    
    await test.PATCH(`${SVC}/GrantsMasterData(ID=${grantId},IsActiveEntity=false)`, grantFields, AUTH);
    await test.POST(`${SVC}/GrantsMasterData(ID=${grantId},IsActiveEntity=false)/scope`, { ...scopeBase, ...scope }, AUTH);
    
    return grantId;
}

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

describe('GrantsMasterData lifecycle integration tests', () => {
    beforeAll(async () => {
        await test;
    });

    it('creates a grant draft and assigns admission scopes', async () => {
        const grantId = await createGrantWithScope({
            typeIncome_code: 'FOERDERUNGSERHALT',
            typeOutcome_code: 'MATERIALBESCHAFFUNG'
        });

        const { data: grant, status } = await test.GET(`${SVC}/GrantsMasterData(ID=${grantId},IsActiveEntity=false)?$expand=scope`, AUTH);
        
        expect(status).toBe(200);
        expect(grant.grantNumber).toBe('TEST-01');
        expect(grant.scope).toHaveLength(1);
        expect(grant.scope[0].typeIncome_code).toBe('FOERDERUNGSERHALT');
        expect(grant.scope[0].typeOutcome_code).toBe('MATERIALBESCHAFFUNG');
    });

    it('successfully activates a formally valid grant draft', async () => {
        const grantId = await createGrantWithScope({
            typeIncome_code: 'ZUSTIFTUNGEN',
            typeOutcome_code: 'REISEKOSTEN'
        });
        
        const { status } = await activate(grantId);
        expect(status).toBe(201);
        
        const { data: active, status: activeStatus } = await test.GET(`${SVC}/GrantsMasterData(ID=${grantId},IsActiveEntity=true)`, AUTH);
        expect(activeStatus).toBe(200);
        expect(active.IsActiveEntity).toBe(true);
    });
});
