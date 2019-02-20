const alexaTest = require('alexa-skill-test-framework');
const AWS = require('aws-sdk-mock');
// AWS.mock('DynamoDB')
alexaTest.initialize(
  require('../lambda/index.js'),
  'amzn1.ask.skill.470fcaa9-d8d9-4c48-8ac3-37b8425bd784',
  'arn:aws:iam::822617710188:user/Administrator',
);

describe('Name Analyzer Skill returns correct result', () => {
  describe('LaunchRequestHandler', () => {
    alexaTest.test([
      {
        request: alexaTest.getLaunchRequest(),
        says: 'Welcome to Name Analyzer. I have some insight into your name... whats your first name and your gender?',
        reprompts: 'Surrender your name and gender',
      },
    ]);
  });

  describe('RestartorEndIntentHandler prompts user for name and gender on YesIntent', () => {
    alexaTest.test([
      { 
        request: alexaTest.getIntentRequest('AMAZON.YesIntent'),
        withSessionAttributes: {dialog: 'Second description read.' },
        says: 'Please give me another name and gender so I can analyze it.',
      },
    ]);
  });

  describe('RestartorEndIntentHandler ends the session on Nointent', () => {
    alexaTest.test([
      { 
        request: alexaTest.getIntentRequest('AMAZON.NoIntent'),
        withSessionAttributes: {dialog: 'Second description read.' },
        shouldEndSession: true,
      },
    ]);
  });

  //  Mocking the database during testing was giving me trouble.
  // describe('InProgressGetNameGenderIntentHandler', () => {
  //   alexaTest.test([
  //     {
  //       request: alexaTest.getIntentRequest('UserFirstNameGenderIntent', {userName: 'Greg', gender: 'male'}),
  //       hasAttributes: {
  //         userName: 'Greg',
  //         gender: 'male'
  //       }
  //     },
  //   ]);
  // });
});
