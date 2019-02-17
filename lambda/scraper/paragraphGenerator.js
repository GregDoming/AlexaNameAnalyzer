const rp = require('request-promise');
const cheerio = require('cheerio');

/**
 * Scrapes kabalarians.com for name analyzation.
 * @param {name} name some name
 * @param {gender} gender The second number to add.
 * @return {result} The first n (from the helper function nth index) sentences returned from webstie
 */


const getNameDescription = async (name, gender) => {
  const url = await rp(`https://www.kabalarians.com/name-meanings/names/${gender}/${name}.htm`);
  const cheer = cheerio.load(url);
  const nameDescription = cheer('#headerOL').contents().slice(3, 4).text();

  const result = await nthIndex(nameDescription, '.', 4);

  return result;
};

const nthIndex = async (str, pat, n) => {
  let index;
  let temp;
  let finalDescription = '';

  for (let i = 1; i < n; i += 1) {
    index = str.indexOf(pat, temp + 1);
    finalDescription = finalDescription.concat(str.slice(temp, index));
    temp = index;
  }

  return finalDescription.concat('.');

  // for (let i = 1; i < n; i += 1) {
  //   index = str.indexOf(pat, temp + 1);
  //   finalDescription.push(str.slice(temp, index));
  //   temp = index;
  // }

  // return finalDescription;
};


module.exports = {
  getNameDescription,
  nthIndex,
};
