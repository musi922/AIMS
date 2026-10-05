import cds from '@sap/cds';
import { GrantServiceOrchestrator } from './grant-service-orchestrator';

export class GrantMasterDataService extends cds.ApplicationService {
    private orchestrator = new GrantServiceOrchestrator();

    async init(): Promise<void> {
        this.before('DELETE', 'GrantsMasterDataScope.drafts', this.orchestrator.checkScopeReferences.bind(this.orchestrator));
        this.before(['CREATE', 'UPDATE'], 'GrantsMasterData', this.orchestrator.validateAndAutoUpdateDates.bind(this.orchestrator));
        this.before(['CREATE', 'UPDATE'], 'GrantsMasterData', this.orchestrator.checkGrantNumberIsUnique.bind(this.orchestrator));
        return super.init();
    }
}