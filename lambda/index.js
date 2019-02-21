const Alexa = require('ask-sdk');
const scrape = require('./scraper/paragraphGenerator.js');
const ddb = require('./dynamoDB/ddb_methods.js');

const rePrompt = 'Surrender your name and gender';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Name Analyzer. I have some insight into your name... whats your first name and your gender?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(rePrompt)
      .getResponse();
  },
};


const InProgressGetNameGenderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'UserFirstNameGenderIntent'
      && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED'; // Will not move to next intent until dialog state === 'COMPLETED' by filling required slot values
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .reprompt(rePrompt)
      .getResponse();
  },
};


const CompletedGetNameGenderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'UserFirstNameGenderIntent'
    && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';
  },
  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const userName = slots.userName.value;
    const gender = slots.gender.value;

    sessionAttributes.userName = userName;
    sessionAttributes.gender = gender;

    if (await ddb.checkUserExists(userName, gender)) {
      // Sets speechText to the first half of the description. 1 = first-half 2 = seconf-half
      const speechText = `${await ddb.getDescription(userName, gender, 1)} Would you like to hear more?`;
      // SessionAttributes.Dialog lets future Intent Handlers know what part of the dialog tree the Alexa skill is at
      sessionAttributes.dialog = 'First description read.';
      sessionAttributes.description = await ddb.getDescription(userName, gender, 1);
      sessionAttributes.description2 = await ddb.getDescription(userName, gender, 2);

      await handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(speechText)
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
      sessionAttributes.dialog = 'Description timed out.';
      return handlerInput.responseBuilder
        .speak('That took awhile. Would you like to hear the description now?')
        .getResponse();
    }
    sessionAttributes.dialog = 'First description read.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

// Reads first description in case of previously mentioned timeout
const DatabaseTimeoutIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && sessionAttributes.dialog === 'Description timed out.'
    && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
    || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const speechText = `${sessionAttributes.description} Would you like to hear more?`;
    sessionAttributes.dialog = 'First description read.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

// Asks user if they would like the second half of the name description
const ContinueDescriptionIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && sessionAttributes.dialog === 'First description read.'
    && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
    || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      const speechText = `${sessionAttributes.description2} Would you like to hear about another name?`;
      sessionAttributes.dialog = 'Second description read.';
      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
    const speechText = 'Would you like to hear about another name?';
    sessionAttributes.dialog = 'Second description read.';


    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

// Asks the user if they would like to hear another name or end the skill.
const RestartorEndIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && sessionAttributes.dialog === 'Second description read.'
    && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
    || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      const speechText = 'Please give me another name and gender so I can analyze it.';

      return handlerInput.responseBuilder
        .speak(speechText)
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
        .speak(speechText)
        .getResponse();
    }
    const speechText = 'Sure! If you want to continue give me your gender and I can give you the meaning behind it';
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};


const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    const speechText = 'yes?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    // any cleanup logic goes here
    return handlerInput.responseBuilder.getResponse();
  },
};


const FallbackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },

  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('I didnt get that, Name and gender please?')
      .reprompt(reprompt)
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
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressGetNameGenderIntentHandler,
    CompletedGetNameGenderIntentHandler,
    ContinueDescriptionIntentHandler,
    RestartorEndIntentHandler,
    DatabaseTimeoutIntentHandler,
    HelpIntentHandler,
    FallbackHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
