const express = require('express');
const taskRepo = require('../../database/task/task-repository');
const db = require('../../database/database');
const router = express.Router();
const log4js = require('log4js');
const authMw = require('../middlewear/auth');
const auth = require('./user-routes');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('../../logs/server.log'), 'server');

const logger = log4js.getLogger('server');

router.get('/', authMw.tokenVerification({token: auth.getToken()}), (req, res) => {
  taskRepo.getTasks(db, auth.getUser(), (result, err) => callbackHandler(res, result, err));
});

router.post('/task', authMw.tokenVerification({token: auth.getToken()}), (req, res) => {
  const task = req.body;
  logger.info('POST request from client: ');
  logger.info(task);
  taskRepo.addTask(task, db, auth.getUser(), (result, err) => callbackHandler(res, result, err));
});

router.delete('/task/:taskId', authMw.tokenVerification({token: auth.getToken()}), (req, res) => {
  const taskId = req.params.taskId;
  logger.info('DELETE request from client by id: ' + taskId);
  taskRepo.deleteTask(taskId, db, auth.getUser(), (result, err) => callbackHandler(res, result, err));
});

router.put('/task/:taskId', authMw.tokenVerification({token: auth.getToken()}), (req, res) => {
  const task = req.body;
  logger.info('PUT request from client: ');
  logger.info(task);
  taskRepo.updateTask(task, db, auth.getUser(), (result, err) => callbackHandler(res, result, err));
});

const callbackHandler = function (res, result, err) {
  if (err) {
    res.sendStatus(500);
  }
  if (result) {
    res.status(200).json(result);
  } else {
    res.sendStatus(201);
  }
};

module.exports = router;