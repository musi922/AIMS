import cds from '@sap/cds';
import { GrantServiceOrchestrator } from './grant-service-orchestrator';
import { GrantsMasterData } from '#cds-models/GrantMasterDataService'

export class GrantMasterDataService extends cds.ApplicationService {
    private orchestrator = new GrantServiceOrchestrator();

    async init(): Promise<void> {

        this.before('NEW', GrantsMasterData.drafts, this.orchestrator.handleNewDraft.bind(this.orchestrator));

        return super.init();
    }
}