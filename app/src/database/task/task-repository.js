const Sequelize = require('sequelize');
const log4js = require('log4js');
const logger = log4js.getLogger('server');

function getTaskTable (sequelize, tableName) {
  logger.info('Getting table: ' + tableName);
  const task = sequelize.define('task', {
    name: {type: Sequelize.STRING},
    complete: {type: Sequelize.INTEGER},
  }, {
    tableName: tableName,
  });
  return task;
}

exports.getTasks = function (db, user, callback) {
  const userTasks = getTaskTable(db.getSequelize(), user.table);
  userTasks.sync().catch((err) => logger.error(err));
  if (userTasks.getTableName()) {
    userTasks.findAll()
      .then((result) => callback(result, null))
      .catch((err) => {
        logger.error(err);
        callback(null, err);
      });
  } else {
    callback(null, null);
  }
};

exports.addTask = function (task, db, user, callback) {
  const userTasks = getTaskTable(db.getSequelize(), user.table);
  if (userTasks.getTableName()) {
    userTasks.create({
      name: task.name,
      complete: task.complete,
    }).then(() => callback(task, null))
      .catch((err) => {
        logger.error(err);
        callback(null, err);
      })
  } else {
    callback(null, null);
  }
};

exports.deleteTask = function (taskId, db, user, callback) {
  const userTasks = getTaskTable(db.getSequelize(), user.table);
  if (userTasks.getTableName()) {
    userTasks.destroy({where: {id: taskId}})
      .then(result => callback(result, null))
      .catch((err) => {
        logger.error(err);
        callback(null, err);
      })
  } else {
    callback(null, null);
  }
};

exports.updateTask = function (task, db, user, callback) {
  const userTasks = getTaskTable(db.getSequelize(), user.table);
  if (userTasks.getTableName()) {
    userTasks.update(task, {where: {id: task.id}})
      .then(result => callback(result, null))
      .catch((err) => {
        logger.error(err);
        callback(null, err);
      })
  } else {
    callback(null, null);
  }
};
