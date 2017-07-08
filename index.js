const app = require('./app/src/server/server');
const dotenv = require('dotenv').config();

app.start(dotenv);

process.on('SIGINT', () => {
  app.close();
  process.exit();
});
