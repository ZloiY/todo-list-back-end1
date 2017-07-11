const Sequelize = require('sequelize');
const log4js = require('log4js');
const logger = log4js.getLogger('server');

function getUserTable(sequelize) {
  logger.info('Getting user table: users');
  const user = sequelize.define('user', {
    login: { type: Sequelize.STRING },
    pass_hash: { type: Sequelize.STRING },
    salt: { type: Sequelize.STRING },
    table: { type: Sequelize.STRING },
  }, {
    tableName: 'users',
  });
  return user;
}

exports.authUser = function (db, user, callback) {
  getUserTable(db.getSequelize()).sync().catch((err) => logger.error(err));
  getUserTable(db.getSequelize()).findOne({where: {login: user.login}})
    .then(() => callback(null))
    .catch((err) => {
      logger.error(err);
      callback(err);
    });
};

exports.createUser = function (db, user, callback) {
  getUserTable(db.getSequelize()).sync().catch((err) => logger.error(err));
  getUserTable(db.getSequelize()).create({
    login: user.login,
    pass_hash: user.pass,
    salt: user.salt,
    table: user.table,
  }).then(() => callback(null))
    .catch((err) => {
      logger.error(err);
      callback(err);
    });
};
