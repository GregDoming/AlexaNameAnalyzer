const help = async () => {
  const scrape = await scraper.getNameDescription('Ted', 'male');
  await addUser('Ted', 'male', scrape);
  const final = await getDescription('Ted', 'male', 1);
  return final;
};
console.log('look here');
help().then(data => console.log(data));