using { campusgrantflow.db as db } from '../db/schema';

@requires: 'authenticated-user'
service GrantMasterDataService {
    @odata.draft.enabled
    entity GrantsMasterData as projection on db.GrantsMasterData;

    @odata.draft.enabled
    entity GrantApplications   as projection on db.GrantApplications;

    @readonly entity CL_Sponsor as projection on db.CL_Sponsor;
    @readonly entity CL_Status as projection on db.CL_Status;
    @readonly entity CL_Department as projection on db.CL_Department;
}