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

describe('GrantsMasterData validation logic', () => {
    it('rejects activation if overheadPercentage is out of range', async () => {
        const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const draft = `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`;
        await test.PATCH(draft, { ...grantFields, overheadPercentage: 150.0 }, AUTH);

        await expect(test.POST(`${draft}/GrantMasterDataService.draftActivate`, {}, AUTH)).rejects.toMatchObject({
            response: { status: 400, data: { error: { code: 'ASSERT_RANGE' } } },
        });
    });

    it('rejects activation if dueTo is on or after validTo', async () => {
        const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const draft = `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`;
        await test.PATCH(draft, { ...grantFields, dueTo: '2099-12-31' }, AUTH);

        await expect(test.POST(`${draft}/GrantMasterDataService.draftActivate`, {}, AUTH)).rejects.toMatchObject({
            response: { status: 400, data: { error: { code: 'ErrorFristBeforeLaufzeit' } } },
        });
    });

    it('activates a valid grant and keeps its status', async () => {
        const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const draft = `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`;
        await test.PATCH(draft, grantFields, AUTH);

        const activation = await test.POST(`${draft}/GrantMasterDataService.draftActivate`, {}, AUTH);
        expect(activation.status).toBe(201);

        const { data: active } = await test.GET(`${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=true)`, AUTH);
        expect(active.status_code).toBe('DRAFT');
    });

    it('sets status to EXPIRED if validTo is in the past', async () => {
        const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const draft = `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`;
        await test.PATCH(draft, { ...grantFields, dueTo: '2019-12-31', validTo: '2020-01-01' }, AUTH);

        const activation = await test.POST(`${draft}/GrantMasterDataService.draftActivate`, {}, AUTH);
        expect(activation.status).toBe(201);

        const { data: active } = await test.GET(`${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=true)`, AUTH);
        expect(active.status_code).toBe('EXPIRED');
    });
});