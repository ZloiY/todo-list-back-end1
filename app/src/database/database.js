const mysql = require('mysql');
const log4js = require('log4js');

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/server.log'), 'server');
const logger = log4js.getLogger('server');
let connection;

exports.addTask = function (taskName, taskCheck, callback) {
  connection.query('insert into tasks (name, complete) values (?, ?)', [taskName, taskCheck], (err, result, fields) => callbackHandler(callback, err, result.insertId));
};

exports.getTasks = function (callback) {
 connection.query('select * from tasks', (err, result) => callbackHandler(callback, err, result));
};


exports.deleteTask = function (taskId, callback) {
  connection.query('delete from tasks where id=' + taskId, (err) => callbackHandler(callback, err));
};

exports.updateTask = function (taskState, taskId, callback) {
  connection.query('update tasks set complete=? where id=?', [taskState, taskId], (err) => callbackHandler(callback, err));
};

exports.createUser = function (config, database, callback) {
  connection.query('create schema if not exists `'+ database + '`', (err) => {
    if (err) {
      logger.error(err);
      callback(err);
    }
    this.connectToDB(config, database, (err) => {
      if (err) {
        callbackHandler(err)
      }
      connection.query('create table if not exists tasks (`id` int not null auto_increment, `name` varchar(50) not null, `complete` int(1) not null,PRIMARY KEY ( `id` ))',
        (err, result, fields) => callbackHandler(callback, err));
    });
  });
};

exports.setUserSalt = function (userSalt, config, callback) {
  const database = 'users';
  this.connectToDB(config, database, (err) => {
    if (err) {
      callbackHandler(err)
    }
    logger.info('Adding salt for user: ' + userSalt.user);
    connection.query('insert into salts (user, salt) values (?, ?)', [userSalt.user, userSalt.salt], (err) => callbackHandler(callback, err));
  });
};

exports.getUserSalt = function (user, config, callback) {
  const database = 'users';
  this.connectToDB(config, database, (err) => {
    if (err) {
      callbackHandler(err);
    }
    connection.query('select salt from salts where `user_id`=?', [user], (err, result) => callbackHandler(callback, err, result));
  });
};

exports.connectToDB = function (config, database, callback) {
  logger.info('logging into account');
  this.closeConnection();
  connection = createDBConnection(config, database);
  connection.connect((err) => callbackHandler(callback, err));
};

exports.waitingForLoggingIn = function (config) {
  connection = createDBConnection(config);
  connection.connect((err) => {
    if (err) {
      logger.error('error connecting: ' + err.stack);
      throw err;
    }
    logger.info('connect as id: ' + connection.threadId);
  });
};

exports.closeConnection = function () {
  connection.end((err) => {
    if (err) {
      logger.error(err.stack);
    }
  });
};

const callbackHandler = function (callback, err, result={}) {
  if (err && err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
    logger.info('Reach timeout, query will be destroy');
    return;
  }
  if (err) {
    logger.error(err);
    callback(err, null);
    return;
  }
  logger.info(result);
  callback(null, result);
};

const createDBConnection = function (config, dbname='') {
  return mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.userName,
    password: config.database.userPass,
    connectTimeout: 1488,
    database: dbname,
  });
};
