const random = require('crypto-random-string');
const jwt = require('jsonwebtoken');

let secret;
let id;

exports.getToken = function () {
  id = random(32);
  const unsignedToken = {
    id: id,
    iat: Math.floor(Date.now() / 1000),
  };
  secret = random(10);
  return jwt.sign(unsignedToken, secret);
};

exports.getSecret = function () {
  return secret;
};

exports.getId = function () {
  return id;
};