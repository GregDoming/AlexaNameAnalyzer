const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-west-2' });

const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

// Schema used to create DynamoDB table

const params = {
  AttributeDefinitions: [
    {
      AttributeName: 'USER_FIRST_NAME',
      AttributeType: 'S',
    },
    {
      AttributeName: 'GENDER',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'USER_FIRST_NAME',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'GENDER',
      KeyType: 'RANGE',
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  TableName: 'USER_LIST',
  StreamSpecification: {
    StreamEnabled: false,
  },
};

ddb.createTable(params, (err, data) => {
  if (err) {
    console.log("ERROR", err);
  } else {
    console.log("Table Created", data);
  }
});
