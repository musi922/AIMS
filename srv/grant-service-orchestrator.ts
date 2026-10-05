import cds from '@sap/cds';

export class GrantServiceOrchestrator {
    constructor() { }

    async handleNewDraft(req: cds.Request): Promise<void> {
        // Placeholder for NEW-draft defaults or validations.
    }

    async checkScopeReferences(req: cds.Request): Promise<void> {
        // TODO: We should Reference a check against Anträge / Finanzplanung once these entities exist ( for now delete is allowed unconditionally )
    }

    async validateAndAutoUpdateDates(req: cds.Request): Promise<void> {
        const { dueTo, validTo } = req.data;

        if (dueTo && validTo && dueTo >= validTo) {
            req.error({ status: 400, message: 'ErrorFristBeforeLaufzeit', target: 'validTo' });
        }

        if (validTo && validTo < new Date().toISOString().slice(0, 10)) {
            req.data.status_code = 'EXPIRED';
        }
    }

    async checkGrantNumberIsUnique(req: cds.Request): Promise<void> {
        const { ID, grantNumber } = req.data;
        if (grantNumber && await SELECT.one.from(req.target.name).where({ grantNumber, ID: { '!=': ID } })) {
            req.error({ status: 400, message: 'ErrorGrantNumberExists', target: 'grantNumber' });
        }
    }
}