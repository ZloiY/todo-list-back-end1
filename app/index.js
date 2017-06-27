const app = require('./src/server/server');

app.start();

process.on('SIGINT', () => {
  app.close();
  process.exit();
});