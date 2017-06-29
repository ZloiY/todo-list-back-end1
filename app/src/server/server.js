const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const db = require('../database/database');
const app = express();
const port = 9000;

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('../../logs/server.log'), 'server');
const logger = log4js.getLogger('server');
const user = {
  login: '',
  pass: '',
};
let configuration;

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(bodyParser.json());

app.get('/tasks', (req, res, next) => {
  logger.info('GET request from client');
  db.getTasks((err, tasks) => errorHandler(err, res, tasks));
});

app.get('/tasks/task/:taskId', (req, res, next) => {
  logger.info('GET request from client by id: ' + req.params.taskId);
  db.getTask(req.params.taskId, (err, task) => errorHandler(err, res, task));
});

app.get('/user', (req, res, next) => {
  logger.info('GET request from client, getting current user');
  if (user.login.length !== 0) {
    res.status(200).send(user);
  } else {
    res.sendStatus(500);
  }
});

app.post('/user', (req, res, next) => {
  const database = req.body.login + '' + req.body.pass;
  user.login = req.body.login;
  logger.info('POST request for adding new user :' + database);
  db.createUser(configuration, database, (err) => errorHandler(err, res));
});

app.post('/user/login', (req, res, next) => {
  const database = req.body.login + '' + req.body.pass;
  user.login = req.body.login;
  logger.info('POST request for authentication :' + database);
  db.connectToDB(configuration, database, (err) => errorHandler(err, res));
});

app.post('/user/logout', (req, res, next) => {
  logger.info('POST request for logout user: ' + req.body.login);
  db.closeConnection();
  db.waitingForLoggingIn(configuration);
  res.sendStatus(200);
});

app.post('/tasks/task', (req, res, next) => {
  const task = req.body;
  logger.info('POST request from client: ');
  logger.info(task);
  db.addTask(task.name, task.complete, (err) => errorHandler(err, res, task));
});

app.delete('/tasks/task/:taskId', (req, res, next) => {
  logger.info('DELETE request from client by id: '+ req.params.taskId);
  db.deleteTask(req.params.taskId, (err) => errorHandler(err, res));
});

app.put('/tasks/task/:taskId', (req, res, next) => {
  const task = req.body;
  logger.info('PUT request from client: ');
  logger.info(task);
  db.updateTask(task.complete, task.id, (err) => errorHandler(err, res, task));
});

exports.start = function (config) {
  configuration = config;
  app.listen(port, () => {
    logger.info('server is up on localhost:' + port);
    db.waitingForLoggingIn(config);
  });
};

exports.close = function () {
  logger.info('shutting down...');
  db.closeConnection();
};

const errorHandler = function (err, response, result = {}) {
  if (err) {
    response.sendStatus(500);
  } else {
    response.status(200).send(result);
  }
};
