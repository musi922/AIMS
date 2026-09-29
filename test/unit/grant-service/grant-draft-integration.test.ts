import { describe, expect, it } from '@jest/globals';
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
    validTo: '2099-12-31',
    active: true,
    sponsor_code: 'DFG',
    status_code: 'DRAFT',
};

describe('GrantsMasterData lifecycle integration tests', () => {
    it('creates a grant draft with scope that is not visible as active entity', async () => {
        const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const draft = `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`;
        await test.PATCH(draft, grantFields, AUTH);
        await test.POST(`${draft}/scope`, { businessDepartment_code: 'MB', typeIncome: 'FOERDERUNGSERHALT', typeOutcome: 'MATERIALBESCHAFFUNG' }, AUTH);

        const { data: read, status } = await test.GET(`${draft}?$expand=scope`, AUTH);

        expect(status).toBe(200);
        expect(read.grantNumber).toBe('TEST-01');
        expect(read.scope).toHaveLength(1);
        expect(read.scope[0].typeIncome).toBe('FOERDERUNGSERHALT');
        expect(read.scope[0].typeOutcome).toBe('MATERIALBESCHAFFUNG');
        await expect(test.GET(`${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=true)`, AUTH)).rejects.toMatchObject({
            response: { status: 404 },
        });
    });

    it('activates a valid grant draft and keeps its scope', async () => {
        const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const draft = `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`;
        await test.PATCH(draft, grantFields, AUTH);
        await test.POST(`${draft}/scope`, { businessDepartment_code: 'MB', typeIncome: 'ZUSTIFTUNGEN', typeOutcome: 'REISEKOSTEN' }, AUTH);

        const activation = await test.POST(`${draft}/GrantMasterDataService.draftActivate`, {}, AUTH);
        expect(activation.status).toBe(201);

        const { data: active } = await test.GET(`${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=true)?$expand=scope`, AUTH);
        expect(active.IsActiveEntity).toBe(true);
        expect(active.scope).toHaveLength(1);
        expect(active.scope[0].typeIncome).toBe('ZUSTIFTUNGEN');
        expect(active.scope[0].typeOutcome).toBe('REISEKOSTEN');
    });
});