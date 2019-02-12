const fs = require('fs');
const dotenv = require('dotenv').config();


test('Expect index.js to exist', () => {
  expect(fs.existsSync('index.js')).toBeTruthy();

});
