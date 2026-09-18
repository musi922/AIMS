using { GrantMasterDataService as service } from '../../../srv/grant-service';

annotate service.GrantsMasterData with @(
    UI: {
        DeleteHidden: true,
        HeaderInfo: {
            TypeName: '{i18n>Grant}',
            TypeNamePlural: '{i18n>Grants}',
            Title: {
                $Type: 'UI.DataField',
                Value: GrantName
            },
            Description: {
                $Type: 'UI.DataField',
                Value: ('Förder-ID: ' || GrantNumber)
            }
        },
        SelectionFields: [
            Sponsor_code,
            Scope.BusinessDepartment_code
        ],
        Identification: [
            {
                $Type: 'UI.DataFieldForAction',
                Action: 'GrantMasterDataService.startApplication',
                Label: '{i18n>ApplyGrant}'
            }
        ],
        HeaderFacets: [
            {
                $Type: 'UI.ReferenceFacet',
                ID: 'HeaderInfoFacet',
                Label: '{i18n>HeaderInfo}',
                Target: '@UI.FieldGroup#HeaderInfo'
            },
            {
                $Type: 'UI.ReferenceFacet',
                ID: 'HeaderProgramFacet',
                Label: '{i18n>HeaderProgram}',
                Target: '@UI.FieldGroup#HeaderProgram'
            },
            {
                $Type: 'UI.ReferenceFacet',
                ID: 'HeaderParamsFacet',
                Label: '{i18n>HeaderParams}',
                Target: '@UI.FieldGroup#HeaderParams'
            },
            {
                $Type: 'UI.ReferenceFacet',
                ID: 'HeaderHistoryFacet',
                Label: '{i18n>HeaderHistory}',
                Target: '@UI.FieldGroup#HeaderHistory'
            }
        ],
        FieldGroup #HeaderInfo: {
            Data: [
                {
                    $Type: 'UI.DataField',
                    Value: Sponsor_code
                },
                {
                    $Type: 'UI.DataField',
                    Value: Active
                }
            ]
        },
        FieldGroup #HeaderProgram: {
            Data: [
                {
                    $Type: 'UI.DataField',
                    Value: Status_code
                },
                {
                    $Type: 'UI.DataField',
                    Value: DueTo
                }
            ]
        },
        FieldGroup #HeaderParams: {
            Data: [
                {
                    $Type: 'UI.DataField',
                    Value: ValidTo
                },
                {
                    $Type: 'UI.DataField',
                    Value: OverheadPercentage
                },
                {
                    $Type: 'UI.DataField',
                    Value: AmountMax
                }
            ]
        },
        FieldGroup #HeaderHistory: {
            Data: [
                {
                    $Type: 'UI.DataField',
                    Value: modifiedBy
                },
                {
                    $Type: 'UI.DataField',
                    Value: modifiedAt
                },
                {
                    $Type: 'UI.DataField',
                    Value: createdBy
                },
                {
                    $Type: 'UI.DataField',
                    Value: createdAt
                }
            ]
        },
        LineItem: [
            {
                $Type: 'UI.DataField',
                Value: GrantNumber,
                Label : '{i18n>GrantID}',
                ![@HTML5.CssDefaults]: {width: '10%'}
            },
            {
                $Type: 'UI.DataField',
                Value: GrantName,
                Label: '{i18n>GrantName}',
                ![@HTML5.CssDefaults]: {width: '30%'}
            },
            {
                $Type: 'UI.DataField',
                Value: Sponsor_code,
                Label: '{i18n>GrantSponsor}',
                ![@HTML5.CssDefaults]: {width: '20%'}
            },
            {
                $Type: 'UI.DataField',
                Value: Active,
                Label: '{i18n>Active}',
                ![@HTML5.CssDefaults]: {width: '10%'}
            },
            {
                $Type: 'UI.DataField',
                Value: Status_code,
                Label: '{i18n>Status}',
                Criticality: Status.criticality,
                ![@HTML5.CssDefaults]: {width: '10%'}
            },
            {
                $Type: 'UI.DataField',
                Value: DueTo,
                Label : '{i18n>Deadline}',
                ![@HTML5.CssDefaults]: {width: '10%'}
            },
            {
                $Type: 'UI.DataField',
                Value: modifiedBy,
                Label : '{i18n>ChangedBy}',
                ![@HTML5.CssDefaults]: {width: '10%'}
            }
        ]
    }
);

annotate service.GrantsMasterData with {
    GrantName @Common.Label: '{i18n>GrantName}';
    GrantNumber @Common.Label: '{i18n>GrantID}';
    Active @Common.Label: '{i18n>Active}';
    Sponsor @Common.Label: '{i18n>GrantSponsor}';
    Status @Common.Label: '{i18n>Status}';
    Sponsor_code @Common.Label: '{i18n>GrantSponsor}';
    Status_code @Common.Label: '{i18n>Status}';
    DueTo @Common.Label: '{i18n>Deadline}';
    modifiedBy @Common.Label: '{i18n>ChangedBy}';
    ValidTo @Common.Label: '{i18n>ValidTo}';
    OverheadPercentage @Common.Label: '{i18n>OverheadPercentage}';
    AmountMax @Common.Label: '{i18n>AmountMax}';
    createdAt @Common.Label: '{i18n>createdAt}';
    createdBy @Common.Label: '{i18n>createdBy}';
    modifiedAt @Common.Label: '{i18n>modifiedAt}';
};

annotate service.GrantsMasterData with {
    Scope @Common.Label: '{i18n>Department}';
};