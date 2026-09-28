import cds from '@sap/cds';

export class GrantServiceOrchestrator {
    constructor() { }

    async handleNewDraft(req: cds.Request): Promise<void> {
        // Placeholder for NEW-draft defaults or validations.
    }

    async checkScopeReferences(req: cds.Request): Promise<void> {
        // TODO: We should Reference a check against Anträge / Finanzplanung once these entities exist ( for now delete is allowed unconditionally )
    }
}
