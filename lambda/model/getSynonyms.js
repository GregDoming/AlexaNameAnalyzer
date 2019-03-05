const fs = require('fs');

/**
 * Creates an object containing all synonym values for gender from the interaction model.
 */

const getSynonyms = () => {
  const synonymsObj = {};
  const data = fs.readFileSync('model/InteractionModel.json', 'utf8');
  const parsedData = JSON.parse(data);
  parsedData.interactionModel.languageModel.types.forEach((ele) => {
    if (ele.name === 'USER_GENDER') {
      synonymsObj.userGender = [];
      for (let i = 0; i < ele.values.length; i += 1) {
        const slotsObj = {};
        slotsObj[ele.values[i].name.value] = ele.values[i].name.synonyms;
        synonymsObj.userGender.push(slotsObj);
      }
    }
  });
  return synonymsObj;
};

module.exports = {
  getSynonyms,
};
