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

exports.authUser = function (db, token, user, response) {
  getUserTable(db.getSequelize()).sync().catch((err) => logger.error(err));
  getUserTable(db.getSequelize()).findOne({where: {login: user.login}})
    .then(result => response.status(200).json(token))
    .catch((err) => {
      logger.error(err);
      response.sendStatus(500);
    });
};

exports.createUser = function (db, user, response) {
  getUserTable().sync().catch((err) => logger.error(err));
  getUserTable().create({
    login: user.login,
    pass_hash: user.pass,
    salt: user.salt,
    table: user.table,
  }).then(() => response.sendStatus(200))
    .catch((err) => {
      logger.error(err);
      response.sendStatus(500);
    });
};
