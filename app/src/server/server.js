const User = require('../database/user/user');
const userRepo = require('../database/user/user-repository');
const taskRepo = require('../database/task/task-repository');
const db = require('../database/database');
const express = require('express');
const authMw = require('./middlewear/auth');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const jwt = require('jsonwebtoken');
const token = require('../jwt/jwt');
const app = express();

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

app.get('/tasks', authMw.tokenVerification({token: token}), (req, res) => {
   taskRepo.getTasks(res, db, user);
    res.sendStatus(401);
});

app.get('/user', authMw.tokenVerification({token: token}), (req, res) => {
  logger.info('GET request from client, getting current user');
  if (user.login.length !== 0) {
    res.status(200).send(user);
  } else {
    res.sendStatus(500);
  }
});

app.post('/user', (req, res) => {
  user = new User(req.body.login, req.body.pass);
  logger.info('POST request for user registration: ');
  logger.info(user.login);
  userRepo.createUser(db, user, res);
});

app.post('/user/login', (req, res) => {
  user = new User(req.body.login, req.body.pass);
  const sessionToken = token.getToken();
  userRepo.authUser(db, sessionToken, user, res);
  logger.info('POST request for authentication : ' + user.login);
});

app.post('/user/logout/:token', authMw.tokenVerification({token: token}), (req, res) => {
  logger.info('POST request for logout user: ' + user.login);
  res.sendStatus(200);
});

app.post('/tasks/task', authMw.tokenVerification({token: token}), (req, res) => {
  const task = req.body;
  logger.info('POST request from client: ');
  taskRepo.addTask(task, res, db, user);
  res.sendStatus(401);
});

app.delete('/tasks/task/:taskId', authMw.tokenVerification({token: token}), (req, res) => {
  const taskId = req.params.taskId;
  logger.info('DELETE request from client by id: ' + taskId);
  taskRepo.deleteTask(taskId, res, db, user);
});

app.put('/tasks/task/:taskId', authMw.tokenVerification({token: token}), (req, res) => {
  const task = req.body;
  logger.info('PUT request from client: ');
  logger.info(task);
  taskRepo.updateTask(task, res, db, user);
});

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
