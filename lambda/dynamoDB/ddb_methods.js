const AWS = require('aws-sdk');

const addTable = (name, gender, description) => {
  AWS.config.update({
    region: 'us-west-2',
  });

  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'USER_LIST',
    Item: {
      USER_FIRST_NAME: name,
      GENDER: gender,
      NAME_DESCRIPTION: description,
    },
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.error('Unable to add user. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('User added:', JSON.stringify(data, null, 2));
    }
  });
};


const checkUserExists = async (name, gender) => {
  AWS.config.update({
    region: 'us-west-2',
  });

  const docClient = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: 'USER_LIST',
    Key: {
      USER_FIRST_NAME: name,
      GENDER: gender,
    },
  };

  try {
    const data = await docClient.get(params).promise();
    return (Object.keys(data).length !== 0);
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not connect to db ${error.stack}`,
    };
  }
};


checkUserExists().then((res) => console.log(res))

module.exports = {
  addTable,
};
