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
