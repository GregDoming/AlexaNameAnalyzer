
Find posts, topics, and users...
ASK A QUESTION  
SPACES 
 
 
 
avatar image 
Home  Alexa  Alexa Skills Kit (ASK)
 Question avatar image
Alohakrisi asked · Dec 02 at 8:01 AM
Error handled: Cannot read property 'name' of undefined
Hi

I have had similar errors before but they were always about the test configured. This time the RecommendationIntent won't move from InProgress to Completed. It has a success match with all slots and yet somehow doesn't move on.

Interaction model:

{
    "interactionModel": {
        "languageModel": {
            "invocationName": "elevate me",
            "intents": [
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": []
                },
                {
                    "name": "RecommendationIntent",
                    "slots": [
                        {
                            "name": "energy",
                            "type": "energyType",
                            "samples": [
                                "I have {energy} energy",
                                "{energy} energy"
                            ]
                        },
                        {
                            "name": "valence",
                            "type": "valenceType",
                            "samples": [
                                "I feel {valence}",
                                "{valence}"
                            ]
                        },
                        {
                            "name": "focus",
                            "type": "focusType",
                            "samples": [
                                "I want to focus on {focus}",
                                "{focus}"
                            ]
                        }
                    ],
                    "samples": [
                        "recommend something",
                        "yes start",
                        "I want an activity",
                        "give me an activity",
                        "recommend a well-being activity",
                        "to recommend a well-being activity",
                        "start"
                    ]
                }
            ],
            "types": [
                {
                    "name": "valenceType",
                    "values": [
                        {
                            "name": {
                                "value": "negative",
                                "synonyms": [
                                    "yuck",
                                    "shitty",
                                    "down",
                                    "I can't stand it",
                                    "can't stand it",
                                    "sad",
                                    "blue"
                                ]
                            }
                        },
                        {
                            "name": {
                                "value": "neutral",
                                "synonyms": [
                                    "okay",
                                    "ok",
                                    "alright",
                                    "quite alright",
                                    "fine",
                                    "like Switzerland"
                                ]
                            }
                        },
                        {
                            "name": {
                                "value": "positive",
                                "synonyms": [
                                    "great",
                                    "awesome",
                                    "pumped",
                                    "top of the world"
                                ]
                            }
                        }
                    ]
                },
                {
                    "name": "focusType",
                    "values": [
                        {
                            "name": {
                                "value": "others",
                                "synonyms": [
                                    "other people"
                                ]
                            }
                        },
                        {
                            "name": {
                                "value": "myself",
                                "synonyms": [
                                    "yourself"
                                ]
                            }
                        }
                    ]
                },
                {
                    "name": "energyType",
                    "values": [
                        {
                            "name": {
                                "value": "high",
                                "synonyms": [
                                    "energetic",
                                    "great",
                                    "fit",
                                    "very",
                                    "awesome"
                                ]
                            }
                        },
                        {
                            "name": {
                                "value": "medium",
                                "synonyms": [
                                    "alright",
                                    "soso",
                                    "a bit",
                                    "neutral"
                                ]
                            }
                        },
                        {
                            "name": {
                                "value": "low",
                                "synonyms": [
                                    "not at all",
                                    "wiped out",
                                    "tired",
                                    "zero"
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        "dialog": {
            "intents": [
                {
                    "name": "RecommendationIntent",
                    "confirmationRequired": false,
                    "prompts": {},
                    "slots": [
                        {
                            "name": "energy",
                            "type": "energyType",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": "Elicit.Intent-RecommendationIntent.IntentSlot-energy"
                            }
                        },
                        {
                            "name": "valence",
                            "type": "valenceType",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": "Elicit.Intent-RecommendationIntent.IntentSlot-valence"
                            }
                        },
                        {
                            "name": "focus",
                            "type": "focusType",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": "Elicit.Intent-RecommendationIntent.IntentSlot-focus"
                            }
                        }
                    ]
                }
            ]
        },
        "prompts": [
            {
                "id": "Elicit.Intent-RecommendationIntent.IntentSlot-focus",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "Would you like to focus on yourself or others?"
                    }
                ]
            },
            {
                "id": "Elicit.Intent-RecommendationIntent.IntentSlot-energy",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "How energetic do you feel right now. High, medium or low?"
                    }
                ]
            },
            {
                "id": "Elicit.Intent-RecommendationIntent.IntentSlot-valence",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "What kind of mood are you in. Positive, neutral or negative?"
                    }
                ]
            }
        ]
    }
}
 
 
 
And here's the index.js

const Alexa = require('ask-sdk-core');
 
 
/* INTENT HANDLERS */
 
 
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Welcome to Elevate Me. I will recommend the best well-being activity for you. Do you want to start or stop?')
      .reprompt('Do you want to feel better or stop?')
      .getResponse();
  },
};
 
 
const InProgressRecommendationIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
 
 
    return request.type === 'IntentRequest'
      && request.intent.name === 'RecommendationIntent'
      && request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    let prompt = '';
 
 
    for (const slotName of Object.keys(handlerInput.requestEnvelope.request.intent.slots)) {
      const currentSlot = currentIntent.slots[slotName];
      if (currentSlot.confirmationStatus !== 'CONFIRMED'
                && currentSlot.resolutions
                && currentSlot.resolutions.resolutionsPerAuthority[0]) {
        if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
          if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
            prompt = 'Which would you like';
            const size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;
 
 
            currentSlot.resolutions.resolutionsPerAuthority[0].values
              .forEach((element, index) => {
                prompt += ` ${(index === size - 1) ? ' or' : ' '} ${element.value.name}`;
              });
 
 
            prompt += '?';
 
 
            return handlerInput.responseBuilder
              .speak(prompt)
              .reprompt(prompt)
              .addElicitSlotDirective(currentSlot.name)
              .getResponse();
          }
        } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
          if (requiredSlots.indexOf(currentSlot.name) > -1) {
            prompt = `What ${currentSlot.name} are you looking for`;
 
 
            return handlerInput.responseBuilder
              .speak(prompt)
              .reprompt(prompt)
              .addElicitSlotDirective(currentSlot.name)
              .getResponse();
          }
        }
      }
    }
 
 
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};
 
 
const CompletedRecommendationIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
 
 
    return request.type === 'IntentRequest'
      && request.intent.name === 'RecommendationIntent'
      && request.dialogState === 'COMPLETED';
  },
  handle(handlerInput) {
    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
 
 
    const slotValues = getSlotValues(filledSlots);
 
 
    const key = `${slotValues.focus.resolved}-${slotValues.valence.resolved}-${slotValues.energy.resolved}`;
    const activity = options[slotsToOptionsMap[key]];
 
 
    const speechOutput = `You want to focus on ${slotValues.focus.resolved}, you have ${slotValues.energy.resolved} energy and you feel ${slotValues.valence.resolved}.You should consider trying ${activity.name}`;
 
 
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  },
};
 
 
const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
 
 
    return request.type === 'IntentRequest' 
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('This is Elevate Me. I can help you find the perfect wellbeing activity. You can say, recommend an activity.')
      .reprompt('Would you like to find a wellbeing activity that fits your current circumstances?')
      .getResponse();
  },
};
 
 
const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
 
 
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Bye. Talk to you soon.')
      .getResponse();
  },
};
 
 
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
 
 
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
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. If you want a recommendation say: give me an activity.')
      .getResponse();
  },
};
 
 
/* CONSTANTS */
 
 
const skillBuilder = Alexa.SkillBuilders.custom();
 
 
const requiredSlots = [
  'energy',
  'valence',
  'focus',
];
 
 
const slotsToOptionsMap = { 
  "others-high-negative": 0,
  "others-high-neutral": 1,
  "others-high-positive": 2,
  "others-medium-negative": 3,
  "others-medium-neutral": 4,
  "others-medium-positive": 5,
  "others-low-negative": 6,
  "others-low-neutral": 7,
  "others-low-positive": 8,
  "myself-high-negative": 9,
  "myself-high-neutral": 10,
  "myself-high-positive": 11,
  "myself-medium-negative": 12,
  "myself-medium-neutral": 13,
  "myself-medium-positive": 14,
  "myself-low-negative": 15,
  "myself-low-neutral": 16,
  "myself-low-positive": 17
};
 
 
const options = [ 
  {"name": "Create something or volunteering", "description": "Which intervention do you want to learn more about?"},
  {"name": "Strengthspotting or volunteering", "description": "Which of these two interests you more?"},
  {"name": "Strengthspotting or random act of kindness", "description": "Which one would you like me to explain?"},
  {"name": "Change your perspective or find a role model", "description": "Which of these two interests you?"},
  {"name": "Spend five dollars or animal kindness", "description": "Tell me which one you would like to learn more about."},
  {"name": "Appreciative Walking or Gratitude Text", "description": "Which activity resonates more with you right now?"},
  {"name": "Alternative explanations or change your perspective", "description": "Which of these two is your cup of tea?"},
  {"name": "Loving-kindness meditation or Social media", "description": "Which one feels more like you right now?"},
  {"name": "Gratitude text or loving-kindness meditation", "description": "What do feel like doing more right now?"},
  {"name": "Strenuous chore or exercising", "description": "Which one can I tell you more about?"},
  {"name": "Walking Meditation or exercising", "description": "Which one?"},
  {"name": "Novel strengths use or exercising", "description": "What would you like to learn more about?"},
  {"name": "Expressive Writing or Nature Walk", "description": "What feels more like you now?"},
  {"name": "Collection or Music", "description": "Which one?"},
  {"name": "Three things or diary", "description": "What would bring you more joy now?"},
  {"name": "Sit with the bad or Acceptance", "description": "Which one sounds better?"},
  {"name": "Mindfulness meditation or Phone pictures", "description": "What's more appealing?"},
  {"name": "Reminisce or savor food", "description": "What resonates more?"}
  ]; 
 
 
 
 
/* HELPER FUNCTIONS */
 
 
function getSlotValues(filledSlots) {
  const slotValues = {};
 
 
  console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;
 
 
    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            isValidated: true,
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        resolved: filledSlots[item].value,
        isValidated: false,
      };
    }
  }, this);
 
 
  return slotValues;
}
 
 
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressRecommendationIntent,
    CompletedRecommendationIntent,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler,    
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
 
 
 
  
 
Thanks.

debugging
Like 0 · Save · Comment · Reward user 2 Answers · Write an Answer
 avatar image
Alohakrisi answered · Jan 27 at 6:38 AM · ACCEPTED ANSWER
The issue was that the slot value sequence in the key variable did not match the sequence in the slot mapping.

const key = `${slotValues.focus.resolved}-${slotValues.valence.resolved}-${slotValues.energy.resolved}`;
In the above mentioned key the sequence is focus-valence-energy.

However the slot map shows a different sequence:

const slotsToOptionsMap = {   
"others-high-negative": 0
}
focus-energy-valence

By changing the sequence in const key to match the sequence in the slot map everything worked.

Like 0 · Comment · Share · Reward user avatar image
barry@amazon answered · Dec 03 at 7:47 AM
Hi @Alohakrisi,

According to the erro message, your code is trying to access the property name of, what I would guess, a slot. My suggestion would be for you to do some logging after the dialog is complete to check exact what your skill is passing to your code.

Regards,
Barry

Like 1 · Comment ·  Hide 2 · Share · Reward user
avatar imageAlohakrisi · Jan 21 at 2:40 PM
Hi Barry (or anyone else inclined to help out)

It seems to go into CompletedRecommendationIntent and then stop before Alexa can actually say anything. How would you set up the logging you suggested earlier here?

I tried

console.log("THIS.EVENT = " + JSON.stringify(this.event));

in another skill and it only kept complaining, that THIS.EVENT is undefined. The console log I set-up below comes up in CloudWatch but I am not sure what else to log and how exactly to do that.

const CompletedRecommendationIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log('CompletedRecommendationIntent starts now.'); 
    return request.type === 'IntentRequest'
      && request.intent.name === 'RecommendationIntent'
      && request.dialogState === 'COMPLETED';
  },
  handle(handlerInput) {
    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;


    const slotValues = getSlotValues(filledSlots);
    
    const key = `${slotValues.focus.resolved}-${slotValues.valence.resolved}-${slotValues.energy.resolved}`;
    const activity = options[slotsToOptionsMap[key]];
    
    const speechOutput = `You want to focus on ${slotValues.focus.resolved}, you have ${slotValues.energy.resolved} energy and you feel ${slotValues.valence.resolved}.You should consider trying ${activity.name}`;


    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  },
};

  0 · Reply · Share · More
 avatar imageRokasV  Alohakrisi · Jan 21 at 11:48 PM
I haven't worked too much with dialog management, but first thing, would be to try to log more info about error, so update your code in ErrorHandler to also log stack trace:

console.log(`Error handled: ${error.name} - ${error.message}`)
console.log(error.stack)
This will give the stack trace of the error which should point to the exact line that causes the issue.

  0 · Reply · Share · More
Write an Answer
avatar image 
HTML Editor
Source
Preview



Add some details...
0
Hint: Notify or tag a user in this post by typing @username.
FOLLOWQUESTION DETAILS
2 People are following this question.

 ANSWERS  ANSWERS AND COMMENTS
RELATED QUESTIONS
Get HTTP from External Website 5 Answers

Alexa skill and website control 5 Answers

Resource List for ASK / AVS Devs 3 Answers

How do I push to an Echo device? 5 Answers

Deploying ASK as service on my server. 2 Answers

Contact Us  | App Distribution Agreement  | Terms of Use
© 2010-2019, Amazon.com, Inc. or its affiliates. All Rights Reserved.