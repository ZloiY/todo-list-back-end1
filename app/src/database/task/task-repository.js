const Sequelize = require('sequelize');
const log4js = require('log4js');
const logger = log4js.getLogger('server');

function getTaskTable (sequelize, tableName) {
  logger.info('Getting table: ' + tableName);
  sequelize.authenticate()
    .catch((err) => logger.error('Bad connection ' + err.stack));
  const task = sequelize.define('task', {
    name: {type: Sequelize.STRING},
    complete: {type: Sequelize.INTEGER},
  }, {
    tableName: tableName,
  });
  return task;
}

exports.getTasks = function (response, db, user) {
  const userTasks = getTaskTable(db.getSequelize(), user.table);
  userTasks.sync().catch((err) => logger.error(err));
  if (userTasks.getTableName()) {
    userTasks.findAll()
      .then((result) => {
        response.status(200).send(result);
      })
      .catch((err) => {
        logger.error(err);
        response.sendStatus(500);
      });
  } else {
    response.sendStatus(201);
  }
};

exports.addTask = function (task, response, db, user) {
  const userTasks = getTaskTable(db.getSequelize(), user.table);
  if (userTasks.getTableName()) {
    userTasks.create({
      name: task.name,
      complete: task.complete,
    }).then(() => response.status(200).json(task))
      .catch((err) => {
        logger.error(err);
        response.sendStatus(500);
      })
  } else {
    response.sendStatus(201);
  }
};

exports.deleteTask = function (taskId, response, db, user) {
  const userTasks = getTaskTable(db.getSequelize(), user.table);
  if (userTasks.getTableName()) {
    userTasks.destroy({where: {id: taskId}})
      .then(() => response.sendStatus(200))
      .catch((err) => {
        logger.error(err);
        response.sendStatus(500);
      })
  } else {
    response.sendStatus(201);
  }
};

exports.updateTask = function (task, response, db, user) {
  const userTasks = getTaskTable(db.getSequelize(), user.table);
  if (userTasks.getTableName()) {
    userTasks.update(task, {where: {id: task.id}})
      .then(() => response.sendStatus(200))
      .catch((err) => {
        logger.error(err);
        response.sendStatus(500);
      })
  } else {
    response.sendStatus(201);
  }
};
