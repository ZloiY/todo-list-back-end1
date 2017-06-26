const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 9000;
const mysql = require('mysql');
const connection = mysql.createConnection('mysql://user:user@localhost/tasks_schem');

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(bodyParser.json());

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connect as id: ' + connection.threadId);
});

app.get('/tasks', (req, res, next) => {
  console.log('GET request from client');
  connection.query('select * from tasks', (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    console.log(result);
    res.status(200).send(result);
  });
});

app.get('/tasks/task/:taskId', (req, res, next) => {
  console.log('GET request from client by id: ' + req.params.taskId);
  connection.query('select * from tasks where id=' + req.params.taskId, (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    console.log(result);
    res.status(200).send(result);
  });
});

app.post('/tasks/task', (req, res, next) => {
  const task = req.body;
  console.log('POST request from client:');
  connection.query('insert into tasks(task_name, task_check) values(?,?)', [task.task_name, task.task_check], (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    console.log(task);
    res.status(200).send(task);
  });
});

app.delete('/tasks/task/:taskId', (req, res, next) => {
  console.log('DELETE request from client');
  connection.query('delete from tasks where id=' + req.params.taskId, (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    console.log('Deleting task by id: ' + req.params.taskId);
    res.status(200).send(req.params.taskId);
  });
});

app.put('/tasks/task/:taskId', (req, res, next) => {
  const task = req.body;
  console.log('PUT request from client: ');
  console.log(task);
  connection.query('update tasks set task_check=? where id=?',[task.task_check,req.params.taskId], (err, result, fields) => {
    if (err) {
      res.sendStatus(500);
      throw err;
    }
    console.log('Updating task:' + req.params.taskId);
    res.status(200).send(task);
  });
});

process.on('SIGINT', () => {
  console.log('closing sql connection');
  connection.end();
  console.log('shutdown server');
  process.exit();
});

app.listen(port, () => {
  console.log('server is up on localhost:'+port);
});
