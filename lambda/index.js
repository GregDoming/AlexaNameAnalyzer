const Alexa = require('ask-sdk');
const scrape = require('./scraper/paragraphGenerator.js');
const ddb = require('./dynamoDB/ddb_methods.js');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Name Analyzer. I have some insight into your name... whats your first name and your gender?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};


const InProgressGetNameGenderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'UserFirstNameGenderIntent'
      && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
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
      const speechText = `${await ddb.getDescription(userName, gender, 1)} Would you like to hear more?`;
      sessionAttributes.description = await ddb.getDescription(userName, gender, 1);
      
      await handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }

    const description = await scrape.getNameDescription(userName, gender, 4);
    await ddb.addUser(userName, gender, description);
    let speechText = await ddb.getDescription(userName, gender, 1);

    sessionAttributes.description = await ddb.getDescription(userName, gender, 1);

    // sessionAttributes.sentenceNumber += 2;
    await handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    while (speechText === undefined) {
      speechText = await ddb.getDescription(userName, gender, 1);
    }


    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

// const ContinueDescriptionIntentHandler ={
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//     && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';

//   },
//   async handle(handlerInput) {
//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const count = sessionAttributes.sentenceNumber;

//     const speechText = await ddb.getDescription(userName, gender, count);

//     return handlerInput.responseBuilder
//     .speak(speechText)
//     .getResponse();
//   },
// };
// const CompletedGetNickNameGenderIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//     && handlerInput.requestEnvelope.request.intent.name === 'UserNickNameGenderIntent'
//     && handlerInput.requestEnvelope.request.intent.slots.gender.value
//     && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
//   },
//   async handle(handlerInput) {
//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const slots = handlerInput.requestEnvelope.request.intent.slots;
//     const userName = slots.userName.value;
//     const gender = slots.gender.value;

//     sessionAttributes.userName = userName;
//     sessionAttributes.gender = gender;
//     handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

//     if (await ddb.checkUserExists(userName, gender)) {
//       const speechText = `${await ddb.getDescription(userName, gender)}   Would you like to hear about another name?`;

//       return handlerInput.responseBuilder
//         .speak(speechText)
//         .getResponse();
//     }

//     const description = await scrape.getNameDescription(userName, gender);
//     await ddb.addUser(userName, gender, description);
//     const speechText = await ddb.getDescription(userName, gender);

//     return handlerInput.responseBuilder
//       .speak(speechText)
//       .addElicitSlotDirective
//       .getResponse();
//   },
// };

// const GetAnotherDescriptionIntent {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//     && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED'
//     && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
//     || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent')

//   },
//   handle(handlerInput) {

//   }
// }

// const NameIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//       && handlerInput.requestEnvelope.request.intent.name === 'UserFirstNameIntent';
//   },
//   handle(handlerInput) {
// const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
// const slots = handlerInput.requestEnvelope.request.intent.slots;
// const userName = slots.name.value;
// const speechText = `Hey ${userName} nice to meet you. What is your gender?`;

// sessionAttributes.name = userName;
// handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

//     return handlerInput.responseBuilder
//       .speak(speechText)
//       .getResponse();
//   },
// };


// const GenderIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//       && handlerInput.requestEnvelope.request.intent.name === 'UserGenderIntent';
//   },
// async handle(handlerInput) {
// const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
// const slots = handlerInput.requestEnvelope.request.intent.slots;
// const gender = slots.gender.value;
// const userName = sessionAttributes.name;

// sessionAttributes.gender = gender;
// handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

// if (await ddb.checkUserExists(userName, gender)) {
//   const speechText = `${await ddb.getDescription(userName, gender) }   Would you like to hear about another name?`;

//   return handlerInput.responseBuilder
//     .speak(speechText)
//     .getResponse();
// }

// const description = await scrape.getNameDescription(userName, gender);
// await ddb.addUser(userName, gender, description);
// const speechText = await ddb.getDescription(userName, gender);

// return handlerInput.responseBuilder
//   .speak(speechText)
//   .withSimpleCard('You are a', gender)
//   .getResponse();
// },
// };

// const InProgressStartOverIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//       && (handlerInput.requestEnvelope.intent.name === 'AMAZON.YesIntent'
//         || handlerInput.requestEnvelope.intent.name === 'AMAZON.NoIntent');
//   },
//   handle(handlerInput) {
//     const speechText = 'Would you like to learn about another name?';

//     return handlerInput.responseBuilder
//       .speak(speechText)
//       .getResponse();
//   },
// };


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
    InProgressGetNameGenderIntentHandler,
    CompletedGetNameGenderIntentHandler,
    HelpIntentHandler,
    // InProgressStartOverIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
