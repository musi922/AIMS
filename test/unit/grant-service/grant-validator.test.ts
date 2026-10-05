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
        await test.PATCH(draft, { ...grantFields, grantNumber: 'TEST-02', dueTo: '2019-12-31', validTo: '2020-01-01' }, AUTH);

        const activation = await test.POST(`${draft}/GrantMasterDataService.draftActivate`, {}, AUTH);
        expect(activation.status).toBe(201);

        const { data: active } = await test.GET(`${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=true)`, AUTH);
        expect(active.status_code).toBe('EXPIRED');
    });

    it('rejects activation if grantNumber already exists', async () => {
        const { data: first } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const firstDraft = `${SVC}/GrantsMasterData(ID=${first.ID},IsActiveEntity=false)`;
        await test.PATCH(firstDraft, { ...grantFields, grantNumber: 'TEST-03' }, AUTH);
        await test.POST(`${firstDraft}/GrantMasterDataService.draftActivate`, {}, AUTH);

        const { data: second } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const secondDraft = `${SVC}/GrantsMasterData(ID=${second.ID},IsActiveEntity=false)`;
        await test.PATCH(secondDraft, { ...grantFields, grantNumber: 'TEST-03' }, AUTH);

        await expect(test.POST(`${secondDraft}/GrantMasterDataService.draftActivate`, {}, AUTH)).rejects.toMatchObject({
            response: { status: 400, data: { error: { code: 'ErrorGrantNumberExists' } } },
        });
    });

    it('allows editing an active grant that keeps its own grantNumber', async () => {
        const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const draft = `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`;
        await test.PATCH(draft, { ...grantFields, grantNumber: 'TEST-04' }, AUTH);
        await test.POST(`${draft}/GrantMasterDataService.draftActivate`, {}, AUTH);

        const active = `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=true)`;
        await test.POST(`${active}/GrantMasterDataService.draftEdit`, { PreserveChanges: true }, AUTH);
        await test.PATCH(draft, { grantName: 'Geaendert' }, AUTH);
        await test.POST(`${draft}/GrantMasterDataService.draftActivate`, {}, AUTH);

        const { data: updated } = await test.GET(active, AUTH);
        expect(updated.grantName).toBe('Geaendert');
    });
});