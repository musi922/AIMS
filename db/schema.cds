using {
  cuid,
  managed,
  sap.common.CodeList,
  Currency
} from '@sap/cds/common';

namespace campusgrantflow.db;

entity CL_Sponsor : CodeList {
  key code : String(50);
}

entity CL_Status : CodeList {
  key code        : String(50);
  criticality : Integer;
}

entity CL_Department : CodeList {
  key code : String(50);
}

entity GrantsMasterData : cuid, managed {
  grantNumber                : String(255) not null;
  grantName                  : String(255) not null;
  sponsor                    : Association to one CL_Sponsor not null;
  status                     : Association to one CL_Status not null;
  active                     : Boolean default true;
  dueTo                      : Date not null;
  validFrom                  : Date;
  validTo                    : Date not null;
  durationMax                : Decimal(2, 0);
  amountMax                  : Decimal(10, 2) not null;
  currency                   : Currency default 'EUR';
  overheadPercentage         : Decimal(5, 2) not null @assert.range: [0, 100];
  personnelCostPercentageMax : Decimal(5, 2);
  additionalGuidelines       : String(255);
  scope                      : Composition of many GrantsMasterDataScope on scope.parent = $self;
  documents                  : Composition of many GrantsMasterDataDocument on documents.parent = $self;

  applications               : Association to many GrantApplications on applications.parentGrant = $self;
}

entity GrantsMasterDataScope : cuid, managed {
  parent             : Association to GrantsMasterData;
  typeIncome         : String(255);
  typeOutcome        : String(255);
  businessDepartment : Association to one CL_Department;
}

entity GrantsMasterDataDocument : cuid, managed {
  parent          : Association to GrantsMasterData;
  document        : LargeBinary
                    @Core.MediaType                    : mediaType
                    @Core.ContentDisposition.Filename  : fileName
                    @Core.ContentDisposition.Type      : 'attachment';
  fileName        : String(255) not null;
  mediaType       : String(255) @Core.IsMediaType;
  documentName    : String(255);
  documentComment : String(1000);
}

entity GrantApplications : cuid, managed {
  parentGrant               : Association to GrantsMasterData;
  projectTitle              : String(255) not null;
  internalProjectNumber     : String(50);
  externalApplicationNumber : String(50);
  acronym                   : String(50);
  projectManager            : String(100) not null;
  department                : Association to one CL_Department not null;
  startDate                 : Date not null;
  endDate                   : Date not null;
  durationYears             : Integer not null;
  description               : LargeString not null;
  applicantVerified         : Boolean default true;
  departmentAdmissible      : Boolean default true;
  costs                     : Composition of many GrantApplicationCosts on costs.parent = $self;
}

entity GrantApplicationCosts : cuid, managed {
  parent             : Association to GrantApplications;
  costType           : String(255) not null;
  ownFundsPercentage : Decimal(5, 2) @assert.range: [0, 100];
  years              : Composition of many GrantApplicationCostYears on years.parent = $self;
}

entity GrantApplicationCostYears : cuid, managed {
  parent     : Association to GrantApplicationCosts;
  yearNumber : Integer not null;
  amount     : Decimal(13, 2) @assert.range: [0, _];
}