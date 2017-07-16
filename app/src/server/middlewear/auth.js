const jwt = require('jsonwebtoken');
const JWT = require('../../jwt/jwt');

exports.tokenVerification = function() {
  return function (req, res, next) {
    if (jwt.verify(req.query.token, JWT.getSecret()).id === JWT.getToken().getId()){
      next();
    } else {
      res.sendStatus(401);
    }
  }
};