const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
const scrape = require('./scraper/paragraphGenerator.js');
const ddb = require('./dynamoDB/ddb_methods.js');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Name Analyzer. I have some insight into your name... whats your first name?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(speechText)
      .getResponse();
  },
};


const NameIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'UserFirstNameIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const userName = slots.name.value;
    const speechText = `Hey ${userName} nice to meet you. What is your gender?`;
    const repromptText = "I didn't quite catch that, what is your gender?";

    sessionAttributes.name = userName;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .withSimpleCard('Your name is', userName)
      .getResponse();
  },
};


const GenderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'UserGenderIntent';
  },
  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const gender = slots.gender.value;
    const userName = sessionAttributes.name;

    sessionAttributes.gender = gender;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    if (await ddb.checkUserExists(userName, gender)) {
      const speechText = await ddb.getDescription(userName, gender);

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('You are a', gender)
        .getResponse();
    }

    const description = await scrape.getNameDescription(userName, gender);
    await ddb.addUser(userName, gender, description);
    const speechText = await ddb.getDescription(userName, gender);

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('You are a', gender)
      .getResponse();
  },
};

const StartOverIntentHandler = {
  canHandle(handlerInput) {
    return handlerinput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.type === 'AMAZON.YesIntent'
        || handlerInput.requestEnvelope.request.type === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const speechText = 'Would you like to learn about another name?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};


const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    // access to session persistent data
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const speechText = 'goodbye';

    return handlerInput.responseBuilder
      .speak('Dont be lame come back tomorrow and find out about more names')
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

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say your name.')
      .reprompt('Sorry, I can\'t understand the command. Please say your name.')
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    NameIntentHandler,
    GenderIntentHandler,
    StartOverIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
