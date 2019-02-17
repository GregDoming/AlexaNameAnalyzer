const AWS = require('aws-sdk');
const scraper = require('../scraper/paragraphGenerator.js');

const addUser = async (name, gender, description) => {
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

  await docClient.put(params, (err, data) => {
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

  const docClient = await new AWS.DynamoDB.DocumentClient();

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

const getDescription = async (name, gender, sentenceNumber) => {
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
    const splitIndex = data.Item.NAME_DESCRIPTION.match('(?:[^.]+[.:;]){2}')[0].length;

    if (sentenceNumber === 1) {
      return data.Item.NAME_DESCRIPTION.substring(0, splitIndex);
    }
    return data.Item.NAME_DESCRIPTION.substring(184);
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not connect to db ${error.stack}`,
    };
  }
  // try {
  //   const data = await docClient.get(params).promise();
  //   return `${data.Item.NAME_DESCRIPTION[0]} ${data.Item.NAME_DESCRIPTION[1]}.`;
  // } catch (error) {
  //   return {
  //     statusCode: 400,
  //     error: `Could not connect to db ${error.stack}`,
  //   };
  // }
};

// const help = async () => {
//   const scrape = await scraper.getNameDescription('Ted', 'male');
//   await addUser('Ted', 'male', scrape);
//   const final = await getDescription('Ted', 'male', 1);
//   return final;
// };
// console.log('look here');
// help().then(data => console.log(data));

module.exports = {
  addUser,
  checkUserExists,
  getDescription,
};
