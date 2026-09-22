using { GrantMasterDataService as service } from '../../../srv/grant-service';

annotate service.GrantsMasterData with @(
    UI: {
        DeleteHidden: true,
        HeaderInfo: {
            TypeName: '{i18n>Grant}',
            TypeNamePlural: '{i18n>Grants}',
            Title: {
                $Type: 'UI.DataField',
                Value: grantName
            },
            Description: {
                $Type: 'UI.DataField',
                Value: ('Förder-ID: ' || grantNumber)
            }
        },
        SelectionFields: [
            sponsor_code
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
                    Value: sponsor_code
                },
                {
                    $Type: 'UI.DataField',
                    Value: active
                }
            ]
        },
        FieldGroup #HeaderProgram: {
            Data: [
                {
                    $Type: 'UI.DataField',
                    Value: status_code
                },
                {
                    $Type: 'UI.DataField',
                    Value: dueTo
                }
            ]
        },
        FieldGroup #HeaderParams: {
            Data: [
                {
                    $Type: 'UI.DataField',
                    Value: validTo
                },
                {
                    $Type: 'UI.DataField',
                    Value: overheadPercentage
                },
                {
                    $Type: 'UI.DataField',
                    Value: amountMax
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
                Value: grantNumber,
                Label : '{i18n>GrantID}',
                ![@HTML5.CssDefaults]: {width: '10%'}
            },
            {
                $Type: 'UI.DataField',
                Value: grantName,
                Label: '{i18n>GrantName}',
                ![@HTML5.CssDefaults]: {width: '30%'}
            },
            {
                $Type: 'UI.DataField',
                Value: sponsor_code,
                Label: '{i18n>GrantSponsor}',
                ![@HTML5.CssDefaults]: {width: '20%'}
            },
            {
                $Type: 'UI.DataField',
                Value: active,
                Label: '{i18n>Active}',
                ![@HTML5.CssDefaults]: {width: '10%'}
            },
            {
                $Type: 'UI.DataField',
                Value: status_code,
                Label: '{i18n>Status}',
                Criticality: status.criticality,
                ![@HTML5.CssDefaults]: {width: '10%'}
            },
            {
                $Type: 'UI.DataField',
                Value: dueTo,
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
    grantName @Common.Label: '{i18n>GrantName}' @Common.FieldControl: #Mandatory;
    grantNumber @Common.Label: '{i18n>GrantID}' @Common.FieldControl: #Mandatory;
    active @Common.Label: '{i18n>Active}';
    sponsor @Common.Label: '{i18n>GrantSponsor}' @Common.FieldControl: #Mandatory;
    status @Common.Label: '{i18n>Status}' @Common.FieldControl: #Mandatory;
    dueTo @Common.Label: '{i18n>Deadline}' @Common.FieldControl: #Mandatory;
    modifiedBy @Common.Label: '{i18n>ChangedBy}';
    validTo @Common.Label: '{i18n>ValidTo}' @Common.FieldControl: #Mandatory;
    overheadPercentage @Common.Label: '{i18n>OverheadPercentage}' @Common.FieldControl: #Mandatory;
    amountMax @Common.Label: '{i18n>AmountMax}' @Common.FieldControl: #Mandatory;
    additionalGuidelines @Common.Label: '{i18n>AdditionalGuidelines}';
    createdAt @Common.Label: '{i18n>createdAt}';
    createdBy @Common.Label: '{i18n>createdBy}';
    modifiedAt @Common.Label: '{i18n>modifiedAt}';
};

annotate service.GrantsMasterData with {
    scope @Common.Label: '{i18n>Department}';
};