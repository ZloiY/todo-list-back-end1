const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const db = require('../database/database');
const app = express();
const port = 9000;

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('../../logs/server.log'), 'server');
const logger = log4js.getLogger('server');

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
  db.getTasks((err, tasks) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.status(200).send(tasks);
  });
});

app.get('/tasks/task/:taskId', (req, res, next) => {
  logger.info('GET request from client by id: ' + req.params.taskId);
  db.getTask(req.params.taskId, (err, task) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.status(200).send(task);
  });
});

app.post('/registration', (req, res, next) => {
  logger.info('POST request for adding new user :' + req.body.login + ' ' + req.body.pass);
  db.createUser(req.body.login, req.body.pass, (err) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
  });
});

app.post('/authentication', (req, res, next) => {
  logger.info('POST request for authentication :' + req.body.login + ' ' + req.body.pass);
  db.connectToDB(req.body.login, req.body.pass, (err) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
  });
});

app.post('/tasks/task', (req, res, next) => {
  const task = req.body;
  logger.info('POST request from client:');
  db.addTask(task.name, task.check, (err) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.status(200).send(task);
  });
});

app.delete('/tasks/task/:taskId', (req, res, next) => {
  logger.info('DELETE request from client');
  db.deleteTask(req.params.taskId, (err) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.status(200);
  });
});

app.put('/tasks/task/:taskId', (req, res, next) => {
  const task = req.body;
  logger.info('PUT request from client: ');
  logger.info(task);
  db.updateTask(task.check, task.id, (err) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.status(200).send(task);
  });
});

exports.start = function () {
  app.listen(port, () => {
    logger.info('server is up on localhost:' + port);
    db.waitingForLoggingIn();
  });
};

exports.close = function () {
  logger.info('shutting down...');
  db.closeConnection();
};
