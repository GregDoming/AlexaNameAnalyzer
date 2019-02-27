/* eslint-disable no-console */
const AWS = require('aws-sdk');
const AdmZip = require('adm-zip');

const zip = new AdmZip();
//  Adds the folder and all the folders children to the zip que
zip.addLocalFolder('lambda');

//  Zips all files in the zip que to specified location
zip.writeZip('deployment/lambda_zip/nameAnalyzer.zip');

// Formats zip to properly upload to AWS Lambda
const bufferedZip = zip.toBuffer();

const lambda = new AWS.Lambda({
  region: 'us-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const updateFunctionParams = {
  FunctionName: 'nameAnalyzer',
  DryRun: false,
  Publish: false,
  ZipFile: bufferedZip,
};

const updateFunctionConfiguration = {
  FunctionName: 'nameAnalyzer',
  MemorySize: 256,
  Timeout: 10,
  Runtime: 'nodejs8.10',
};

// Updates Lambda Function code
lambda.updateFunctionCode(updateFunctionParams, (err, data) => {
  if (err) console.log(err, err.stack);
  else console.log(data);
});

// Updates Lambda Function settings, there are many settings I am not interacting with yet.
lambda.updateFunctionConfiguration(updateFunctionConfiguration, (err, data) => {
  if (err) console.log(err, err.stack);
  else console.log(data);
});

// Code to update the function from the CLI (keeping here in case I decide to revert back)
// aws lambda update-function-code --function-name nameAnalyzer --zip-file fileb://deployment/lambda_zip/nameAnalyzer.zip --timeout 10 --memory-size 128