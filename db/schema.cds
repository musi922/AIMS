using {
  cuid,
  managed,
  sap.common.CodeList,
  Currency
} from '@sap/cds/common';

namespace foerderfinder.db;

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
  overheadPercentage         : Decimal(5, 2) not null;
  personnelCostPercentageMax : Decimal(5, 2);
  additionalGuidelines       : String(255);
  scope                      : Composition of many GrantsMasterDataScope on scope.parent = $self;
}

entity GrantsMasterDataScope : cuid, managed {
  parent             : Association to GrantsMasterData;
  typeIncome         : String(255);
  typeOutcome        : String(255);
  businessDepartment : Association to one CL_Department;
}
