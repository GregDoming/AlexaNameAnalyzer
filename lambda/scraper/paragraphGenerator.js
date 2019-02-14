const rp = require('request-promise');
const cheerio = require('cheerio');


const getNameDescription = async (name, gender) => {
  const url = await rp(`https://www.kabalarians.com/name-meanings/names/${gender}/${name}.htm`);
  const $ = cheerio.load(url);
  const nameDescription = $('#headerOL').contents().slice(3, 4).text()

  const result = nthIndex(nameDescription, '.', 4);

  return result;
};

const nthIndex = (str, pat, n) => {
  let index;
  let temp;
  let finalDescription = '';

  for (let i = 0; i < n; i += 1) {
    if (i === 0) {
      index = str.indexOf(pat);
      finalDescription = finalDescription.concat(str.slice(0, index));
    } else {
      index = str.indexOf(pat, temp + 1);
      finalDescription = finalDescription.concat(str.slice(temp, index));
      temp = index;
    }
  }
  return finalDescription.concat('.');
};

getNameDescription('Greg', 'male');
module.exports = {
  getNameDescription,
  nthIndex,
};
