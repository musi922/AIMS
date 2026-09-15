using {foerderfinder.db as schema} from './schema';

annotate schema.CL_Sponsor with {
  code @(
    Common.Text           : name,
    Common.TextArrangement: #TextOnly,
    Common.ValueList      : {
      CollectionPath: 'CL_Sponsor',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          ValueListProperty: 'code',
          LocalDataProperty: code
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name'
        }
      ]
    }
  );
};

annotate schema.CL_Status with {
  code @(
    Common.Text           : name,
    Common.TextArrangement: #TextOnly,
    Common.ValueList      : {
      CollectionPath: 'CL_Status',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          ValueListProperty: 'code',
          LocalDataProperty: code
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name'
        }
      ]
    }
  );
};

annotate schema.CL_Department with {
  code @(
    Common.Text           : name,
    Common.TextArrangement: #TextOnly,
    Common.ValueList      : {
      CollectionPath: 'CL_Department',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          ValueListProperty: 'code',
          LocalDataProperty: code
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name'
        }
      ]
    }
  );
};

annotate schema.GrantsMasterData with {
  Sponsor      @(
    Common.Text                    : Sponsor.name,
    Common.TextArrangement         : #TextOnly,
    Common.ValueListWithFixedValues: true
  );
  Status       @(
    Common.Text                    : Status.name,
    Common.TextArrangement         : #TextOnly,
    Common.ValueListWithFixedValues: true
  );
};

annotate schema.GrantsMasterDataScope with {
  BusinessDepartment @(
    Common.Text                    : BusinessDepartment.name,
    Common.TextArrangement         : #TextOnly,
    Common.ValueListWithFixedValues: true
  );
};
