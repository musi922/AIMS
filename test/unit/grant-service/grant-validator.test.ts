import { beforeAll, describe, expect, it } from '@jest/globals';
import cds from '@sap/cds';

const test = cds.test('serve', '--with-mocks', '--in-memory?').in(process.cwd());

const SVC = '/odata/v4/grant-master-data';
const AUTH = { auth: { password: '', username: 'alice' } };

// Utility to generate unique test entries
const getValidGrantFields = () => ({
    grantNumber: `TEST-${Math.floor(Math.random() * 100000)}`,
    grantName: 'Foerderung',
    amountMax: 50000.0,
    overheadPercentage: 10.0,
    dueTo: '2026-12-31',
    validTo: '2028-12-31',
    active: true,
    sponsor_code: 'DFG',
    status_code: 'DRAFT',
});

async function draftActivate(grantId: string): Promise<{ body?: unknown; status: number }> {
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

    describe('overheadPercentage validation', () => {
        it('rejects if overheadPercentage is > 100', async () => {
            // Arrange
            const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
            await test.PATCH(`${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`, { ...getValidGrantFields(), overheadPercentage: 150.0 }, AUTH);

            // Act
            const { body, status } = await draftActivate(grant.ID);

            // Assert
            expect(status).toBe(400);
            expect((body as { error?: { message?: string } })?.error?.message).toMatch(/between 0 and 100/);
        });

        it('rejects if overheadPercentage is < 0', async () => {
            // Arrange
            const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
            await test.PATCH(`${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`, { ...getValidGrantFields(), overheadPercentage: -5.0 }, AUTH);

            // Act
            const { body, status } = await draftActivate(grant.ID);

            // Assert
            expect(status).toBe(400);
            expect((body as { error?: { message?: string } })?.error?.message).toMatch(/between 0 and 100/);
        });

        it('resolves successfully if overheadPercentage is exactly 100 (upper boundary)', async () => {
            // Arrange
            const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
            await test.PATCH(`${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`, { ...getValidGrantFields(), overheadPercentage: 100.0 }, AUTH);

            // Act
            const { status } = await draftActivate(grant.ID);

            // Assert
            expect(status).toBe(201);
        });

        it('resolves successfully if overheadPercentage is exactly 0 (lower boundary)', async () => {
            // Arrange
            const { data: grant } = await test.POST(`${SVC}/GrantsMasterData`, {}, AUTH);
            await test.PATCH(`${SVC}/GrantsMasterData(ID=${grant.ID},IsActiveEntity=false)`, { ...getValidGrantFields(), overheadPercentage: 0.0 }, AUTH);

            // Act
            const { status } = await draftActivate(grant.ID);

            // Assert
            expect(status).toBe(201);
        });
    });
});
