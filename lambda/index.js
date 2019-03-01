/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
const Alexa = require('ask-sdk');
const scrape = require('./scraper/paragraphGenerator.js');
const ddb = require('./dynamoDB/ddb_methods.js');

const reprompt = 'Surrender your name and gender';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    // Gets the db according to the user's unique Amazon ID (amz.etc.....).
    const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
    // await attributesManager.deletePersistentAttributes(); <---- is for testing purposes.
    const loginName = persistentAttributes.loginName;
    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.state = 'Started';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Checks to see if the user has logged in before.
    if (!loginName) {
      const speechText = 'Welcome to Name Analyzer. I have some insight into your name... whats your first name and gender?';

      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(false)
        .reprompt(reprompt)
        .getResponse();
    }
    const speechText = `Welcome back to Name Analyzer ${loginName}. Give me a first name and gender so I can analyze them please`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .reprompt(reprompt)
      .getResponse();
  },
};


const InProgressGetNameGenderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'UserFirstNameGenderIntent'
      && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED'; // Will not move to next intent until state state === 'COMPLETED' by filling required slot values
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.state = 'Started';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .reprompt(reprompt)
      .withShouldEndSession(false)
      .getResponse();
  },
};


const CompletedGetNameGenderIntentHandler = {
  canHandle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'UserFirstNameGenderIntent'
    && sessionAttributes.state !== 'loginName'
    && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const userName = slots.userName.value;
    const gender = slots.gender.value;
    // console.log(slots.gender['resolutions']['resolutionsPerAuthority'][0]['status']['code'])

    const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.userName = userName;
    sessionAttributes.gender = gender;

    // Checks if User has logged in before, if not sets user's login name permanantly.
    if (!persistentAttributes.loginName) {
      persistentAttributes.loginName = userName;
      attributesManager.savePersistentAttributes();
    }

    if (await ddb.checkUserExists(userName, gender)) {
      // Sets speechText to the first half of the description. 1 = first-half 2 = seconf-half
      const speechText = `${await ddb.getDescription(userName, gender, 1)} Would you like to hear more?`;
      // SessionAttributes.Dialog lets future Intent Handlers know what part of the state tree the Alexa skill is at
      sessionAttributes.state = 'First description read.';
      sessionAttributes.description = await ddb.getDescription(userName, gender, 1);
      sessionAttributes.description2 = await ddb.getDescription(userName, gender, 2);
      await attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(false)
        .getResponse();
    }
    const description = await scrape.getNameDescription(userName, gender, 4);
    await ddb.addUser(userName, gender, description);
    const speechText = `${await ddb.getDescription(userName, gender, 1)} Would you like to hear more?`;

    // Save first and second half of the name description to persistent session variables.
    sessionAttributes.description = await ddb.getDescription(userName, gender, 1);
    sessionAttributes.description2 = await ddb.getDescription(userName, gender, 2);
    await handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Performing three consecutive async calls occasionally times-out the Alexa skill. This allows the user to still hear first half of skill in case of timeout
    if (speechText === '[object Object] Would you like to hear more?') {
      sessionAttributes.state = 'Description timed out.';
      return handlerInput.responseBuilder
        .speak('That took awhile. Would you like to hear the description now?')
        .withShouldEndSession(false)
        .getResponse();
    }
    sessionAttributes.state = 'First description read.';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

// Reads first description in case of previously mentioned timeout
const DatabaseTimeoutIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && sessionAttributes.state === 'Description timed out.'
    && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
    || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const speechText = `${sessionAttributes.description} Would you like to hear more?`;
    sessionAttributes.state = 'First description read.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

// Asks user if they would like the second half of the name description
const ContinueDescriptionIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && sessionAttributes.state === 'First description read.'
    && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
    || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      const speechText = `${sessionAttributes.description2} Would you like to hear about another name?`;
      sessionAttributes.state = 'Second description read.';
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(false)
        .getResponse();
    }
    const speechText = 'Would you like to hear about another name?';
    sessionAttributes.state = 'Second description read.';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

// Asks the user if they would like to hear another name or end the skill.
const RestartorEndIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && sessionAttributes.state === 'Second description read.'
    && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
    || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      const speechText = 'Please give me another name and gender so I can analyze it.';

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(reprompt)
        .withShouldEndSession(false)
        .getResponse();
    }
    const speechText = 'Thanks for using Name Analyzer, goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (sessionAttributes.gender) {
      const speechText = 'Sure! If you want to continue give me your name and I can give you the meaning behind it';
      return handlerInput.responseBuilder
        .withShouldEndSession(false)
        .speak(speechText)
        .getResponse();
    }
    const speechText = 'Sure! If you want to continue give me your gender and I can give you the meaning behind it';
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};


const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
      || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    const speechText = 'Yes? Would you like to hear about another name?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    const speechText = 'Goodbye';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};


const FallbackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },

  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    if (sessionAttributes.state === 'First description read.') {
      return handlerInput.responseBuilder
        .speak('Sorry I couldnt understand you. Would you like me to continue with the description?')
        .getResponse();
    }
    if (sessionAttributes.state === 'Second description read.') {
      return handlerInput.responseBuilder
        .speak('Sorry I couldnt understand you. Would you like me to read another name?')
        .getResponse();
    }
    if (sessionAttributes.state === 'Description timed out.') {
      return handlerInput.responseBuilder
        .speak('Sorry I didint quite get that. Would you like me to begin the description?')
        .getResponse();
    }
    return handlerInput.responseBuilder
      .speak('I didnt get that, Name and gender please?')
      .reprompt(reprompt)
      .withShouldEndSession(false)
      .getResponse();
  },
};


const InprogressResetLoginNameHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'NewLoginNameIntent'
    && sessionAttributes.state !== 'loginName';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
    const loginName = persistentAttributes.loginName;
    const speechText = 'Say <break time="0.2s" /> name is <break time="0.2s" /> followed by a new name <break time="0.1s" /> to change your username';
    sessionAttributes.state = 'loginName';
    attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};


const ResetLoginNameHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'LoginNameChangeIntent'
    && sessionAttributes.state === 'loginName';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const loginName = slots.loginName.value;

    const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
    persistentAttributes.loginName = loginName;
    await attributesManager.savePersistentAttributes();

    sessionAttributes.state = 'Start';
    attributesManager.setSessionAttributes(sessionAttributes);

    const speechText = `Your name has been updated to ${loginName}. Please give me another name and gender to continue or you can say exit.`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};


const RestartAppIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'RestartAppIntent';
  },
  handle(handlerInput) {
    const speechText = 'Starting over, can I get that name and gender?';
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.state = 'Started';
    attributesManager.setSessionAttributes(sessionAttributes);
    attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log('error intent');
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I cant understand the command. Can I have your name and gender please?')
      .reprompt('Sorry, I cant understand the command. Surrender your name and gender.')
      .withShouldEndSession(false)
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.standard()
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressGetNameGenderIntentHandler,
    CompletedGetNameGenderIntentHandler,
    ContinueDescriptionIntentHandler,
    InprogressResetLoginNameHandler,
    RestartorEndIntentHandler,
    ResetLoginNameHandler,
    DatabaseTimeoutIntentHandler,
    RestartAppIntentHandler,
    HelpIntentHandler,
    FallbackHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .withTableName('High-Low-Game')
  .withAutoCreateTable(true)
  .addErrorHandlers(ErrorHandler)
  .lambda();
