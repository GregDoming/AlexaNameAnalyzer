const fs = require('fs');

test('Expect index.js to exist', () => {
  expect(fs.existsSync('index.js')).toBeTruthy();

});
