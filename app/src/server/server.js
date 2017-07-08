const User = require('../database/user/user');
const userRepo = require('../database/user/user-repository');
const taskRepo = require('../database/task/task-repository');
const db = require('../database/database');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const jwt = require('jsonwebtoken');
const token = require('../jwt/jwt');
const app = express();
const port = 9000;

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('../../logs/server.log'), 'server');

const logger = log4js.getLogger('server');
let user;

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(bodyParser.json());

app.get('/tasks', (req, res, next) => {
  if (jwt.verify(req.query.token, token.getSecret()).id === token.getId()) {
   taskRepo.getTasks(res, db, user);
  } else {
    res.sendStatus(401);
  }
});

app.get('/user', (req, res, next) => {
  logger.info('GET request from client, getting current user');
  if (jwt.verify(req.query.token, token.getSecret()).id === token.getId()) {
    if (user.login.length !== 0) {
      res.status(200).send(user);
    } else {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(401);
  }
});

app.post('/user', (req, res, next) => {
  user = new User(req.body.login, req.body.pass);
  logger.info('POST request for user registration: ');
  logger.info(user.login);
  userRepo.createUser(db, user, res);
});

app.post('/user/login', (req, res, next) => {
  user = new User(req.body.login, req.body.pass);
  const sessionToken = token.getToken();
  userRepo.authUser(db, sessionToken, user, res);
  logger.info('POST request for authentication : ' + user.login);
});

app.post('/user/logout/:token', (req, res, next) => {
  if (jwt.verify(req.params.token, token.getSecret()).id === token.getId()) {
    logger.info('POST request for logout user: ' + user.login);
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.post('/tasks/task', (req, res, next) => {
  const task = req.body;
  if (jwt.verify(req.query.token, token.getSecret()).id === token.getId()) {
    logger.info('POST request from client: ');
    taskRepo.addTask(task, res, db, user);
  } else {
    res.sendStatus(401);
  }
});

app.delete('/tasks/task/:taskId', (req, res, next) => {
  const taskId = req.params.taskId;
  if (jwt.verify(req.query.token, token.getSecret()).id === token.getId()) {
    logger.info('DELETE request from client by id: ' + taskId);
    taskRepo.deleteTask(taskId, res, db, user);
  } else {
    res.sendStatus(401);
  }
});

app.put('/tasks/task/:taskId', (req, res, next) => {
  if (jwt.verify(req.query.token, token.getSecret()).id === token.getId()) {
    const task = req.body;
    logger.info('PUT request from client: ');
    logger.info(task);
    taskRepo.updateTask(task, res, db, user);
  } else {
    res.sendStatus(401);
  }
});

exports.start = function (config) {
  app.listen(config.parsed.server_port, () => {
    logger.info('server is up on localhost:' + port);
    db.connectToDb(config.parsed.db_path);
  });
};

exports.close = function () {
  logger.info('shutting down...');
  db.closeConnection();
};
