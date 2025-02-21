const { getClient } = require('./get-client');

(async () => {
  const client = await getClient();
  const medalString = process.argv[2] ?? 'default-medals';
  const registerHash = process.argv[3] ?? 'default-hash';
  
  let insertRow = await client.query('INSERT INTO virgin_medals("medalString", "registerHash", "status") VALUES($1,$2,$3);', [`${medalString}`, `${registerHash}`, `VIRGIN`]);
  console.log(`Inserted ${insertRow.rowCount} row`);
  console.log(`Inserted row ${insertRow}.`);
  await client.end();
})();