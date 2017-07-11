const db = require('../database/database');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const userRoute = require('./routes/user-routes');
const tasksRoute = require('./routes/tasks-routes');
const app = express();
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('../../logs/server.log'), 'server');

const logger = log4js.getLogger('server');

app.use(bodyParser.json());

app.use('/user', userRoute);

app.use('/tasks', tasksRoute);

exports.start = function (config) {
  const port = config.parsed.server_port;
  app.listen(port, () => {
    logger.info('server is up on localhost:' + port);
    db.connectToDb(config.parsed.db_path);
  });
};

exports.close = function () {
  logger.info('shutting down...');
  db.closeConnection();
};
