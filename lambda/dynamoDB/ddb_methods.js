const AWS = require('aws-sdk');

const addUser = (name, gender, description) => {
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
      console.log(data);
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

const getDescription = async (name, gender) => {
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
    return data.Item.NAME_DESCRIPTION;
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not connect to db ${error.stack}`,
    };
  }
};

module.exports = {
  addUser,
  checkUserExists,
  getDescription,
};
