const Sequelize = require('sequelize');
const log4js = require('log4js');
const logger = log4js.getLogger('server');

let sequelize;

exports.connectToDb = function (dbPath) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
  sequelize.authenticate()
    .then(() => logger.info('Connect to database'))
    .catch((err) => logger.error('Unable connect to the database: ' + err.stack));
};

exports.getSequelize = function () {
  return sequelize;
};

exports.closeConnection = function () {
  sequelize.close();
};
