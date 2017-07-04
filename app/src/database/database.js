const mysql = require('mysql');
const log4js = require('log4js');

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/server.log'), 'server');
const logger = log4js.getLogger('server');
let connection;

exports.addTask = function (tableName, taskName, taskCheck, callback) {
  connection.query('insert into `' + tableName + '` (name, complete) values (?, ?)', [taskName, taskCheck], (err, result, fields) => callbackHandler(callback, err, result.insertId));
};

exports.getTasks = function (tableName, callback) {
 connection.query('select * from `' + tableName + '`', (err, result) => callbackHandler(callback, err, result));
};

exports.deleteTask = function (tableName, taskId, callback) {
  connection.query('delete from `' + tableName + '` where id=' + taskId, (err) => callbackHandler(callback, err));
};

exports.updateTask = function (tableName, taskState, taskId, callback) {
  connection.query('update `' + tableName + '` set complete=? where id=?', [taskState, taskId], (err) => callbackHandler(callback, err));
};

exports.createUser = function (config, user, callback) {
  connection.query('insert into users (login, pass_hash, salt, user_table) values (?, ?, ?, ?) ', [user.login, user.pass, user.salt, user.login], (err) => {
    if (err) {
      logger.error(err);
      callback(err);
    } else {
      connection.query('create table if not exists `' +user.login+ '` (`id` int not null auto_increment, `name` varchar(50) not null, `complete` int(1) not null,PRIMARY KEY ( `id` ))',
        (err, result, fields) => callbackHandler(callback, err));
    }
  });
};

exports.getUserSalt = function (login, callback) {
  connection.query('select salt from users where `login`=?', [login], (err, result) => callbackHandler(callback, err, result));
};

exports.getUserPass = function (login, callback) {
  connection.query('select pass_hash from users where `login`=?', [login], (err, result) => callbackHandler(callback, err, result));
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

const createDBConnection = function (config) {
  return mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.userName,
    password: config.database.userPass,
    database: 'todo_list',
    connectTimeout: 1488,
  });
};
