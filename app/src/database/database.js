const Sequelize = require('sequelize');
const log4js = require('log4js');
const logger = log4js.getLogger('server');

let sequelize;

exports.connectToDb = function(config) {
  sequelize = new Sequelize('todo_list', config.parsed.db_user, config.parsed.db_pass, {
    host: config.parsed.host,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  });
  sequelize.authenticate()
    .then(() => logger.info('Connect to database'))
    .catch((err) => logger.error('Unable connect to the database: ' + err.stack));
};

exports.getSequelize = function() {
  return sequelize;
};

exports.closeConnection = function () {
  sequelize.close();
};
