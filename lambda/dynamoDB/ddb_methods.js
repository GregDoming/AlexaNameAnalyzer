const AWS = require('aws-sdk');
const scraper = require('../scraper/paragraphGenerator.js')

/**
 * Adds the name, gender, and description of a user to DynamoDB and returns a string (promise), it will not overwrite.
 * @param {string} name Name of user to add.
 * @param {string} gender Gender of user to add.
 * @param {string} description Description of user to add.
 */

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

/**
 * Checks DynamoDB to see if the user exists and returns a boolean.
 * @param {string} name Name of user to add.
 * @param {string} gender Gender of user to add.
 */

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

/**
 * Gets the first or second half of the corresponding user's description, returns a string.
 * @param {string} name Name of user to look up.
 * @param {string} gender Gender of user to look up.
 * @param {number} sentenceNumber Accepts the number 1 (will return firt half of description) or 2 (will return the second half of the description)
 */

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
    // Index of second sentence
    const splitIndex = data.Item.NAME_DESCRIPTION.match('(?:[^.]+[.:;]){2}')[0].length;

    if (sentenceNumber === 1) {
      return data.Item.NAME_DESCRIPTION.substring(0, splitIndex);
    }
    return data.Item.NAME_DESCRIPTION.substring(splitIndex);
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
// const userName = 'Greg';
// const gender = 'male'
// getDescription(userName, gender, 2).then(data => console.log(data))
// const help = async () => {
//   const scrape = await scraper.getNameDescription('Kevin', 'male', 4);
//   console.log(scrape)
//   await addUser('Kevin', 'male', scrape);
//   const final = await getDescription('Kevin', 'male', 1);
//   return final;
// };
// help()
module.exports = {
  addUser,
  checkUserExists,
  getDescription,
};
