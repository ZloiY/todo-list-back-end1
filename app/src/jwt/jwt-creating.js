const idGen = require('../generators/id-gen');
const secretGen = require('../generators/salt-gen');
const jwt = require('jsonwebtoken');

let secret;
let ident;

exports.getToken = function () {
  ident = idGen.idGen();
  const id = {
    id: ident,
    iat: Math.floor(Date.now() / 1000),
  };
  secret = secretGen.saltGen();
  return jwt.sign(id, secret);
};

exports.getSecret = function () {
  return secret;
};

exports.getId = function () {
  return ident;
};