using {campusgrantflow.db as schema} from './schema';

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

annotate schema.GrantsMasterData with {
  sponsor      @(
    Common.Text                    : sponsor.name,
    Common.TextArrangement         : #TextOnly,
    Common.ValueListWithFixedValues: true
  );
  status       @(
    Common.Text                    : status.name,
    Common.TextArrangement         : #TextOnly,
    Common.ValueListWithFixedValues: true
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



annotate schema.GrantsMasterDataScope with {
  businessDepartment @(
    Common.Text                    : businessDepartment.name,
    Common.TextArrangement         : #TextOnly,
    Common.ValueListWithFixedValues: true,
    Common.ValueList               : {
      CollectionPath: 'CL_Department',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: businessDepartment_code,
          ValueListProperty: 'code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name'
        }
      ]
    }
  );
};
