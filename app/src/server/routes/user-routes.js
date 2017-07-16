const express = require('express');
const db = require('../../database/database');
const router = express.Router();
const log4js = require('log4js');
const authMw = require('../middlewear/auth');
const JWT = require('../../jwt/jwt');
const User = require('../../database/user/user');
const userRepo = require('../../database/user/user-repository');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('../../logs/server.log'), 'server');

const logger = log4js.getLogger('server');
let user;
let jwt;

router.get('/', authMw.tokenVerification(), (req, res) => {
  logger.info('GET request from client, getting current user');
  if (user.login.length !== 0) {
    res.status(200).send(user);
  } else {
    res.sendStatus(500);
  }
});

router.post('/', (req, res) => {
  user = new User(req.body.login, req.body.pass);
  logger.info('POST request for user registration: ');
  logger.info(user.login);
  userRepo.createUser(db, user, (err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

router.post('/login', (req, res) => {
  user = new User(req.body.login, req.body.pass);
  JWT.createToken(user.login);
  logger.info('POST request for authentication : ' + user.login);
  userRepo.authUser(db, user, (err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.status(200).json(JWT.getJWT());
    }
  });
});

router.post('/logout', authMw.tokenVerification(), (req, res) => {
  logger.info('POST request for logout user: ' + user.login);
  res.sendStatus(200);
});

router.getJWT = function () {
  return jwt;
};

router.getUser = function () {
  return user;
};

module.exports = router;
