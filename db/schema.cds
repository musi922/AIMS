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
  GrantNumber                : String(255) not null;
  GrantName                  : String(255) not null;
  Sponsor                    : Association to one CL_Sponsor not null;
  Status                     : Association to one CL_Status not null;
  Active                     : Boolean default true;
  DueTo                      : Date not null;
  ValidFrom                  : Date;
  ValidTo                    : Date not null;
  DurationMax                : Decimal(2, 0);
  AmountMax                  : Decimal(10, 2) not null;
  Currency                   : Currency default 'EUR';
  OverheadPercentage         : Decimal(5, 2) not null;
  PersonnelCostPercentageMax : Decimal(5, 2);
  AdditionalGuidelines       : String(255);
  Scope                      : Composition of many GrantsMasterDataScope on Scope.Parent = $self;
}

entity GrantsMasterDataScope : cuid, managed {
  Parent             : Association to GrantsMasterData;
  TypeIncome         : String(255);
  TypeOutcome        : String(255);
  BusinessDepartment : Association to one CL_Department;
}
