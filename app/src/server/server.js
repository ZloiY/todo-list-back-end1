const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const saltGen = require('../generators/salt-gen');
const jwt = require('jsonwebtoken');
const token = require('../jwt/jwt-creating');
const hasha = require('hasha');
const db = require('../database/database');
const app = express();
const port = 9000;

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('../../logs/server.log'), 'server');
const logger = log4js.getLogger('server');
const user = {
  login: '',
  pass: '',
  database: '',
  token: '',
  secret: '',
  id:'',
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
  if (jwt.verify(req.query.token, user.secret).id === user.id) {
    logger.info('GET request from client, getting tasks');
    db.getTasks(user.login, (err, tasks) => {
      if (err) {
        res.sendStatus(500);
      } else {
        tasks.length ? res.status(200).json(tasks) : res.status(205).json();
      }
    });
  } else {
    res.sendStatus(401);
  }
});

app.get('/user', (req, res, next) => {
  logger.info('GET request from client, getting current user');
  if (jwt.verify(req.query.token, user.secret).id === user.id) {
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
  user.pass = req.body.pass;
  user.login = req.body.login;
  user.salt = saltGen.saltGen();
  logger.info('POST request for user registration: ');
  logger.info(user.login);
  user.pass += user.salt;
  user.pass = hasha(user.pass, {options: 'sha256'});
  db.createUser(configuration, user, (err) => {
    if (err) {
      logger.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(201);
    }
  });
});

app.post('/user/login', (req, res, next) => {
  user.pass = req.body.pass;
  user.login = req.body.login;
  logger.info('POST request for authentication :');
  db.getUserSalt(user.login, (err, result) => {
    const salt = JSON.stringify(result);
    user.pass += salt.slice(10, 20);
    user.pass =  hasha(user.pass, {options: 'sha256'});
    db.getUserPass(user.login, (err, result) => {
      if (err) {
        res.sendStatus(500);
        return;
      }
      const passHash = JSON.stringify(result);
      if (user.pass === passHash.slice(15, 143)) {
        user.token = token.getToken();
        user.secret = token.getSecret();
        user.id = token.getId();
        res.status(200).json(user.token);
      } else {
        res.sendStatus(401);
      }
    });
  });
});

app.post('/user/logout/:token', (req, res, next) => {
  const token = req.params.token;
  if (jwt.verify(token, user.secret).id === user.id) {
    logger.info('POST request for logout user: ' + user.database);
    user.token = '';
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.post('/tasks/task', (req, res, next) => {
  const task = req.body;
  if (user.id === jwt.verify(req.query.token, user.secret).id) {
    logger.info('POST request from client: ');
    db.addTask(user.login, task.name, task.complete, (err, result) => {
      if (err) {
        logger.error(err);
        res.sendStatus(500);
      } else {
        task.id = result;
        logger.info(task);
        res.status(201).send(task);
      }
    });
  } else {
    res.sendStatus(401);
  }
});

app.delete('/tasks/task/:taskId', (req, res, next) => {
  if (jwt.verify(req.query.token, user.secret).id === user.id) {
    logger.info('DELETE request from client by id: ' + req.params.taskId);
    db.deleteTask(user.login, req.params.taskId, (err) => errorHandler(err, res));
  } else {
    res.sendStatus(401);
  }
});

app.put('/tasks/task/:taskId', (req, res, next) => {
  if (jwt.verify(req.query.token, user.secret).id === user.id) {
    const task = req.body;
    logger.info('PUT request from client: ');
    logger.info(task);
    db.updateTask(user.login, task.complete, task.id, (err) => errorHandler(err, res, task));
  } else {
    res.sendStatus(401);
  }
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
