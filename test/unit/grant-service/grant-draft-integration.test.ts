import { beforeAll, describe, expect, it } from '@jest/globals';
import cds from '@sap/cds';

const test = cds.test('serve', '--with-mocks', '--in-memory?').in(process.cwd());

const SVC = '/odata/v4/grant-master-data';
const AUTH = { auth: { password: '', username: 'alice' } };

// Generate random to avoid duplicate keys in sequential test runs
const getValidGrantFields = () => ({
    grantNumber: `TEST-I-${Math.floor(Math.random() * 100000)}`,
    grantName: 'Foerderung',
    amountMax: 50000.0,
    overheadPercentage: 10.0,
    dueTo: '2026-12-31',
    validTo: '2028-12-31',
    active: true,
    sponsor_code: 'DFG',
    status_code: 'DRAFT',
});

const scopeBase = {
    businessDepartment_code: 'MB'
};

async function createGrantWithScope(scope: Record<string, unknown>): Promise<string> {
    // 1. Create Draft
    const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
    const grantId = grant.ID;

    // 2. Patch Draft Data
    await test.PATCH(`${SVC}/GrantsMasterData(ID=${grantId},IsActiveEntity=false)`, getValidGrantFields(), AUTH);

    // 3. Create Draft Scope Item
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
        return { status: res.status, body: res.data };
    } catch (err) {
        const response = (err as { response?: { data?: unknown; status?: number } }).response;
        return { body: response?.data, status: response?.status ?? -1 };
    }
}

describe('GrantsMasterData lifecycle integration tests', () => {
    beforeAll(async () => {
        await test;
    });

    it('creates a grant draft and assigns admission scopes properly', async () => {
        // Arrange
        const expectedIncome = 'FOERDERUNGSERHALT';
        const expectedOutcome = 'MATERIALBESCHAFFUNG';

        // Act
        const grantId = await createGrantWithScope({
            typeIncome_code: expectedIncome,
            typeOutcome_code: expectedOutcome
        });
        const { data: grant, status } = await test.GET(`${SVC}/GrantsMasterData(ID=${grantId},IsActiveEntity=false)?$expand=scope`, AUTH);

        // Assert
        expect(status).toBe(200);
        expect(grant.grantNumber).toMatch(/^TEST-I-/);
        expect(grant.scope).toHaveLength(1);
        expect(grant.scope[0].typeIncome_code).toBe(expectedIncome);
        expect(grant.scope[0].typeOutcome_code).toBe(expectedOutcome);
    });

    it('successfully activates a formally valid grant draft into active entity', async () => {
        // Arrange
        const grantId = await createGrantWithScope({
            typeIncome_code: 'ZUSTIFTUNGEN',
            typeOutcome_code: 'REISEKOSTEN'
        });

        // Act
        const { status } = await activate(grantId);

        // Assert
        expect(status).toBe(201);

        // Fetch the activated entity to confirm 
        const { data: active, status: activeStatus } = await test.GET(`${SVC}/GrantsMasterData(ID=${grantId},IsActiveEntity=true)?$expand=scope`, AUTH);
        expect(activeStatus).toBe(200);
        expect(active.IsActiveEntity).toBe(true);
        expect(active.scope).toHaveLength(1); // the child entity should also be activated
        expect(active.scope[0].typeOutcome_code).toBe('REISEKOSTEN');
    });
});
