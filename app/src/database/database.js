const mysql = require('mysql');
const log4js = require('log4js');

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/server.log'), 'server');
const logger = log4js.getLogger('server');
let connection;

exports.addTask = function (taskName, taskCheck, callback) {
  connection.query('insert into tasks (name, complete) values (?, ?)', [taskName, taskCheck], (err, result, fields) => callbackHandler(callback, err));
};

exports.getTasks = function (callback) {
  return connection.query('select * from tasks', (err, result) => callbackHandler(callback, err, result));
};

exports.getTask = function (taskId, callback) {
  return connection.query('select * from tasks where id=' + taskId, (err, result) => callbackHandler(callback, err, result));
};

exports.deleteTask = function (taskId, callback) {
  connection.query('delete from tasks where id=' + taskId, (err) => callbackHandler(callback, err));
};

exports.updateTask = function (taskState, taskId, callback) {
  connection.query('update tasks set complete=? where id=?', [taskState,taskId], (err) => callbackHandler(callback, err));
};

exports.createUser = function (userName, userPass, callback) {
  connection.query('create schema if not exists '+ userName + '' + userPass, (err) => {
    if (err) {
      logger.error(err);
      callback(err);
    }
  });
  this.connectToDB(userName, userPass, (err) => {
    if (err) {
      logger.error(err);
    }
    connection.query('create table if not exists tasks (`id` int not null auto_increment, `name` varchar(50) not null, `complete` int(1) not null,PRIMARY KEY ( `id` ))',
      (err, result, fields) => callbackHandler(callback, err));
  });
};

exports.connectToDB = function (userName, userPass, callback) {
  logger.info('logging into account');
  connection.end();
  connection = mysql.createConnection('mysql://user:user@localhost/' + userName + '' + userPass);
  connection.connect((err) => callbackHandler(callback, err));
  logger.info('connection id:' + connection.threadId);
};

exports.waitingForLoggingIn = function () {
  connection= mysql.createConnection('mysql://user:user@localhost/');
  connection.connect((err) => {
    if (err) {
      logger.error('error connecting: ' + err.stack);
      throw err;
    }
    logger.info('connect as id: ' + connection.threadId);
  });
};

exports.closeConnection = function () {
  connection.destroy();
};

const callbackHandler = function (callback, err, result={}) {
  if (err) {
    logger.error(err.stack);
    callback(err, null);
  }
  logger.info(result);
  callback(null, result);
};
