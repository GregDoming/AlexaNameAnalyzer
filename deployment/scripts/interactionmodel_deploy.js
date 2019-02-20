const mySmapiClient = require('node-alexa-smapi')();
const mySecrets = require('./secrets.json');
const dotenv = require('dotenv')

mySmapiClient.tokens.refresh({
  refreshToken: mySecrets.refreshToken,
  clientId: mySecrets.clientId,
  clientSecret: mySecrets.clientSecret,
}).then(() => {
    mySmapiClient.vendors.list().then(result => {
      console.log(`My vendor list: ${JSON.stringify(result, null, ' ')}`);
    })
  });