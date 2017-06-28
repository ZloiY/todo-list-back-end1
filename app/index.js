const path = require('path');
const fs = require('fs');
const app = require('./src/server/server');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), {encoding: 'utf8'}));

app.start(config);

process.on('SIGINT', () => {
  app.close();
  process.exit();
});