const AWS = require('aws-sdk');
const AdmZip = require('adm-zip');
const dotenv = require('dotenv');

const lambda = new AWS.Lambda({
  region: 'us-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const zip = new AdmZip();

zip.addLocalFile('lambda/index.js');
zip.writeZip('deployment/lambda_zip/nameAnalyzer.zip');

const bufferedZip = zip.toBuffer();

const updateFunctionParams = {
  FunctionName: 'nameAnalyzer', /* required */
  DryRun: false,
  Publish: false,
  ZipFile: bufferedZip,
};

lambda.updateFunctionCode(updateFunctionParams, (err, data) => {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
