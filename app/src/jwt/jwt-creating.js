const idGen = require('../generators/id-gen');
const secretGen = require('../generators/salt-gen');
const jwt = require('jsonwebtoken');

exports.getToken = function () {
  const id = { id: idGen.idGen(), iat: Math.floor(Date.now() / 1000) + (60 * 60),};
  const secret = secretGen.saltGen();
  return jwt.sign(id, secret);
};