const rp = require('request-promise');
const cheerio = require('cheerio');

/**
 * Scrapes kabalarians.com for name analyzation and returns a string.
 * @param  {string} name The name to look up.
 * @param {string} gender The gender to look up with the name. Male and female give different descriptions
 * @param {number} n Grabs the first n sentences of the description (up to seven).
 */


const getNameDescription = async (name, gender, n) => {
  const url = await rp(`https://www.kabalarians.com/name-meanings/names/${gender}/${name}.htm`);
  const cheer = cheerio.load(url);
  // Scrapes the entire name dexcription and gets rid of double spaces to comply with Alexa ssml formating.
  const nameDescription = cheer('#headerOL').contents().slice(3, 4).text()
    .replace(/\s\s+/g, ' ');
  // Returns the first n sentences from the description.
  const result = await nthIndex(nameDescription, '.', n + 1);

  return result;
};

/**
 * Helper function to return n sentences from the scraped website.
 * @param {string} str some name
 * @param {string} pattern The string pattern to look for.
 * @return {result} The first n - 1 (from the helper function nth index) sentences returned from webstie
 */

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
};
getNameDescription('Greg', 'male', 4);
module.exports = {
  getNameDescription,
  nthIndex,
};
