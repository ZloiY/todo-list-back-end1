const mysql = require('mysql');
const log4js = require('log4js');

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/server.log'), 'server');
const logger = log4js.getLogger('server');
let connection;

exports.addTask = function (taskName, taskCheck) {
  connection.query('insert into tasks(name, check) values(?,?)', [taskName, taskCheck], (err, result, fields) => {
    if (err) {
      logger.error(err);
      return err;
    }
  });
};

exports.getTasks = function (callback) {
  return connection.query('select * from tasks', (err, result) => {
    if (err) {
      logger.error(err);
      callback(err, null);
    }
    logger.info(result);
    callback(null, result);
  });
};

exports.getTask = function (taskId, callback) {
  return connection.query('select * from tasks where id=' + taskId, (err, result) => {
    if (err) {
      logger.error(err);
      callback(err, null)
    }
    logger.info(result);
    callback(null, result);
  });
};

exports.deleteTask = function (taskId, callback) {
  connection.query('delete from tasks where id=' + taskId, (err) => {
    if (err) {
      logger.error(err);
      callback(err);
    }
  });
};

exports.updateTask = function (taskState, taskId, callback) {
  connection.query('update tasks set check=? where id=?', [taskState,taskId], (err) => {
    if (err) {
      logger.error(err);
      callback(err);
    }
  });
};

exports.createUser = function (userName, userPass, callback) {
  connection.query('create schema if not exists '+ userName + '' + userPass, (err) => {
    if (err) {
      logger.error(err);
      callback(err);
    }
  });
  this.connectToDB(userName, userPass);
  connection.query('create table if not exists tasks (id int not null auto_increment, name varchar(50) not null, check int(1), primary key (`id`))',
    (err, result, fields) => {
      if (err) {
        logger.error(err);
        callback(err);
      }
  });
};

exports.connectToDB = function (userName, userPass, callback) {
  logger.info('logging into account');
  connection.end();
  connection = mysql.createConnection('mysql://user:user@localhost/' + userName + '' + userPass);
  connection.connect((err) => {
    if (err) {
      logger.error('error connecting: ' + err.stack);
      callback(err);
    }
    logger.info('connect as id: ' + connection.threadId);
  });
};

exports.waitingForLoggingIn = function (callback) {
  connection= mysql.createConnection('mysql://user:user@localhost/tasks_schem');
  connection.connect((err) => {
    if (err) {
      logger.error('error connecting: ' + err.stack);
      callback(err);
    }
    logger.info('connect as id: ' + connection.threadId);
  });
};

exports.closeConnection = function () {
  connection.destroy();
};
