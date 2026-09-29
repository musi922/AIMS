import { describe, expect, it } from '@jest/globals';
import cds from '@sap/cds';
import { text } from 'node:stream/consumers';

const test = cds.test('serve', '--with-mocks', '--in-memory?').in(process.cwd());

const SVC = '/odata/v4/grant-master-data';
const AUTH = { auth: { password: '', username: 'alice' } };

const grantFields = {
    active: true,
    amountMax: 50000.0,
    dueTo: '2026-12-31',
    grantName: 'Foerderung',
    grantNumber: 'TEST-01',
    overheadPercentage: 10.0,
    sponsor_code: 'DFG',
    status_code: 'DRAFT',
    validTo: '2099-12-31',
};

describe('GrantsMasterDataDocument', () => {
    it('keeps an uploaded document through activation and serves it as attachment', async () => {
        const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
        const draft = `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`;
        await test.PATCH(draft, grantFields, AUTH);
        const { data: document } = await test.POST(`${draft}/documents`, { fileName: 'guideline.pdf', mediaType: 'application/pdf' }, AUTH);
        await test.PUT(`${draft}/documents(ID=${document.ID},IsActiveEntity=false)/document`, '%PDF-1.4', {
            ...AUTH,
            headers: { 'Content-Type': 'application/pdf' },
        });

        const activation = await test.POST(`${draft}/GrantMasterDataService.draftActivate`, {}, AUTH);
        expect(activation.status).toBe(201);

        const { data, headers } = await test.GET(
            `${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=true)/documents(ID=${document.ID},IsActiveEntity=true)/document`,
            AUTH
        );
        expect(await text(data)).toBe('%PDF-1.4');
        expect(headers['content-type']).toContain('application/pdf');
        expect(headers['content-disposition']).toContain('attachment');
        expect(headers['content-disposition']).toContain('guideline.pdf');
    });
});