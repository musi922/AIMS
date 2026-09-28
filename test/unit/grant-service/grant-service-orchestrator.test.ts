import { describe, expect, it, jest } from '@jest/globals';
import cds from '@sap/cds';

import { GrantServiceOrchestrator } from '../../../srv/grant-service-orchestrator';

cds.test('serve', '--with-mocks', '--in-memory?').in(process.cwd());

describe('GrantServiceOrchestrator', () => {
    it('handleNewDraft resolves without error on a new empty draft', async () => {
        const orchestrator = new GrantServiceOrchestrator();
        const req = { data: {} } as unknown as cds.Request;
        await expect(orchestrator.handleNewDraft(req)).resolves.toBeUndefined();
    });

    it('checkScopeReferences resolves without error (no linked records yet)', async () => {
        const orchestrator = new GrantServiceOrchestrator();
        const req = { data: {} } as unknown as cds.Request;
        await expect(orchestrator.checkScopeReferences(req)).resolves.toBeUndefined();
    });
});
