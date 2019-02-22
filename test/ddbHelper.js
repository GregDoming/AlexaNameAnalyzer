
const dynalite = require('dynalite');
const AWS = require('aws-sdk');

const dynaliteServer = dynalite({ createTableMs: 50 });

/**
 * Creates a virtual instance of Dynamo db, but has not been implemented in testing yet.
 */

module.exports.mockDB = () => {
  AWS.config.update({
    region: 'us-west-2',
    endpoint: 'http://localhost:4567',
  });

  const docClient = new AWS.DynamoDB();

  return new Promise((resolve, reject) => {
    dynaliteServer.listen(4567, (err) => {
      docClient.listTables({}, (err, data) => {
        if (err) console.log(err, err.stack);
        else if (data.TableNames.length <= 0) {
          docClient.createTable({
            TableName: 'TestDB',
            KeySchema: [
              { AttributeName: 'USER_FIRST_NAME', KeyType: 'HASH' }, // Partition key
              { AttributeName: 'GENDER', KeyType: 'RANGE' }, // Sort key
            ],
            AttributeDefinitions: [
              { AttributeName: 'USER_FIRST_NAME', AttributeType: 'S' },
              { AttributeName: 'GENDER', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
          (err, data) => {
            if (err) {
              console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
              reject(err);
            } else {
              setTimeout(() => {
                resolve(data);
              }, 1000);
            }
          });
        } else { resolve(); }
      });
    });
  });
};
