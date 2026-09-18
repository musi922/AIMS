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
                Value: grantNumber
            }
        },
        SelectionFields: [
            sponsor_code
        ],
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
    grantName @Common.Label: '{i18n>GrantName}';
    grantNumber @Common.Label: '{i18n>GrantID}';
    active @Common.Label: '{i18n>Active}';
    sponsor @Common.Label: '{i18n>GrantSponsor}';
    status @Common.Label: '{i18n>Status}';
    sponsor_code @Common.Label: '{i18n>GrantSponsor}';
    status_code @Common.Label: '{i18n>Status}';
    dueTo @Common.Label: '{i18n>Deadline}';
    modifiedBy @Common.Label: '{i18n>ChangedBy}';
};

annotate service.GrantsMasterData with {
    scope @Common.Label: '{i18n>Department}';
};

annotate service.GrantsMasterDataScope with {
    businessDepartment_code @Common.Label: '{i18n>Department}';
    businessDepartment @Common.Label: '{i18n>Department}';
};