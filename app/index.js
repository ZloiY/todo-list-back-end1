const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const app = express();
const port = 9000;
const mysql = require('mysql');
let connection;

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/server.log'), 'server');
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
  connection.query('select * from tasks', (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      logger.error(err);
    }
    logger.info(result);
    res.status(200).send(result);
  });
});

app.get('/tasks/task/:taskId', (req, res, next) => {
  logger.info('GET request from client by id: ' + req.params.taskId);
  connection.query('select * from tasks where id=' + req.params.taskId, (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
    }
    logger.info(result);
    res.status(200).send(result);
  });
});

app.post('/registration', (req, res, next) => {
  logger.info('POST request for adding new user :' + req.body.login + ' ' + req.body.pass);
  connection.query('create schema if not exists '+ req.body.login + '' + req.body.pass, (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });
  connectToDB(req.body.login, req.body.pass);
  res.sendStatus(200);
  connection.query('create table if not exists tasks (id int not null auto_increment, task_name varchar(50) not null, task_check int(1), primary key (`id`))',
    (err, result, fields) => {
      if (err) {
        res.sendStatus(500);
        logger.error(err);
      }
  });
});

app.post('/authentication', (req, res, next) => {
  logger.info('POST request for authentication :' + req.body.login + ' ' + req.body.pass);
  connectToDB(req.body.login, req.body.pass);
  res.sendStatus(200);
});

app.post('/tasks/task', (req, res, next) => {
  const task = req.body;
  logger.info('POST request from client:');
  connection.query('insert into tasks(task_name, task_check) values(?,?)', [task.task_name, task.task_check], (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      logger.error(err);
    }
    logger.info(task);
    res.status(200).send(task);
  });
});

app.delete('/tasks/task/:taskId', (req, res, next) => {
  logger.info('DELETE request from client');
  connection.query('delete from tasks where id=' + req.params.taskId, (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      logger.error(err);
    }
    logger.info('Deleting task by id: ' + req.params.taskId);
    res.status(200).send(req.params.taskId);
  });
});

app.put('/tasks/task/:taskId', (req, res, next) => {
  const task = req.body;
  logger.info('PUT request from client: ');
  logger.info(task);
  connection.query('update tasks set task_check=? where id=?', [task.task_check,req.params.taskId], (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      logger.error(err);
    }
    logger.info('Updating task:' + req.params.taskId);
    res.status(200).send(task);
  });
});

process.on('SIGINT', () => {
  logger.info('closing sql connection');
  connection.end();
  logger.info('shutdown server');
  process.exit();
});

app.listen(port, () => {
  logger.info('server is up on localhost:' + port);
  waitingForLogging();
});

function connectToDB(userName, userPass) {
  logger.info('logging into account');
  connection.end();
  connection= mysql.createConnection('mysql://user:user@localhost/'+userName+''+userPass);
  connection.connect((err) => {
    if (err) {
      logger.error('error connecting: ' + err.stack);
      return;
    }
    logger.info('connect as id: ' + connection.threadId);
  });
}

function waitingForLogging() {
  connection= mysql.createConnection('mysql://user:user@localhost/');
  connection.connect((err) => {
    if (err) {
      logger.error('error connecting: ' + err.stack);
      return;
    }
    logger.info('connect as id: ' + connection.threadId);
  });
}
