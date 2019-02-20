const AWS = require('aws-sdk');
const AdmZip = require('adm-zip');
const dotenv = require('dotenv');


const zip = new AdmZip();
//  adds the folder and all the colders children to the zip que 

zip.addLocalFolder('lambda');
//  zips all files in the zip que

zip.writeZip('deployment/lambda_zip/nameAnalyzer.zip');

// const bufferedZip = zip.toBuffer();

// const lambda = new AWS.Lambda({
//     region: 'us-west-2',
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
// });

// const updateFunctionParams = {
//   FunctionName: 'nameAnalyzer', /* required */
//   DryRun: false,
//   Publish: false,
//   ZipFile: bufferedZip,
// };

// lambda.updateFunctionCode(updateFunctionParams, (err, data) => {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });

//ask api get-skill -s amzn1.ask.skill.470fcaa9-d8d9-4c48-8ac3-37b8425bd784 --stage development > model/InteractionModel.json