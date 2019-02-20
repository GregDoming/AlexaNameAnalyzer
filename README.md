# AlexaNameAnalyzer
Alexa skill name analyzer
## Scripts 
```sh
npm run test - Zips file and uploads it to aws Lambda. 
npm run update manifest - Zips file, uploads it to aws Lambda, and downloads the Alexa Skills Interaction Model at model/InteractionModel.json.
npm run upload-manifest - Uploads the manifest from model/UpdateModel.json to the Alexa Skills Interaction Model developer console.
```

This is assuming you have your aws developer environment setup on your local machine.

After cloning respository you will need to **npm install in the root folder** and **npm install in the ./lambda folder** where index.js is.

You will have to create a .env file in the root of your directory with the variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

In the **model** folder the interaction model.json is the most recently downloaded Interaction model from the Alexa skills builder.

If you would like to use TravisCi you will need to encrypt the access keys to AWS. Email me for code/instructions.

Some features I would like to add:

DynamoDB testing,
More extensive Lambda function testing,
Pre-populate the database with descriptions to increase performance,
Bundle everything with Webpack,
and expand on the dialog tree in the skill itself

