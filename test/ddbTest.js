/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-unused-vars */

// const ddb = require('../lambda/dynamoDB/ddb_methods.js');
// const TestUtils = require('./ddbHelper');

// const chai = require('chai');
// const assert = require('chai').assert;
// const should = require('chai').should();
// const chaiAsPromised = require('chai-as-promised');

// chai.use(chaiAsPromised);

// // eslint-disable-next-line prefer-arrow-callback
// describe('DynamoDB Tests', function() {
//   before(function(done) {
//     this.timeout(50000);
//     TestUtils.mockDB().then((data) => {
//       done();
//     })
//       .catch((err) => {
//         assert(false, 'Could not create the mock DB');
//         done();
//       });
//   });
//   after()

//   it('The addUser function should work', (done) => {
//     const UserName = 'Greg';
//     const gender = 'male';
//     const description = 'The name of Greg makes you dynamic, restless, independent, ready to accept challenges, and outspoken. You enjoy change, travel, and new experiences. Reacting against injustice, you go out of your way to assist in creating fairness. You are very creative and promotional, and work intensely to carry out your plans.';

//     ddb.addUser(UserName, gender, description).should.eventually.equal({
//       Attributes:
//       {
//         NAME_DESCRIPTION: 'dfgsfdgfsdhfsdhdgfhfd',
//         GENDER: 'male',
//         USER_FIRST_NAME: 'franklin',
//       },
//     })
//     return done();
//   });

  // it('should save a taco', function(){
  // 	return new Promise((resolve, reject) => {

  // 		var event={
  // 			"body":'{"name":"Al pastor","description": "Delicious taco!"}'
  // 		};
  // 		var context={};
  // 		var callback = (ctx, data) => {

  // 			if(data.statusCode == 200){
  // 				resolve(data);
  // 			}
  // 			else{
  // 				reject(data);
  // 			}

  // 		}
  // 		saveTaco(event,context,callback)
  // 	})
  // })
// });
