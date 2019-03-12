// eslint-disable-next-line max-len
// Helper function copied from web to get innter request values like if the dialog resolved with what word etc.
const getSlotValues = (filledSlots) => {
  const slotValues = {};
  // console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
  Object.keys(filledSlots).forEach((item) => {
    const { name } = filledSlots[item];

    if (filledSlots[item]
      && filledSlots[item].resolutions
      && filledSlots[item].resolutions.resolutionsPerAuthority[0]
      && filledSlots[item].resolutions.resolutionsPerAuthority[0].status
      && filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            resolvedId: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.id,
            isValidated: true,
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        resolved: filledSlots[item].value,
        isValidated: false,
      };
    }
  }, this);
  return slotValues;
};

module.exports = {
  getSlotValues,
};
