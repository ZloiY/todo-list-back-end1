const jwt = require('jsonwebtoken');

exports.tokenVerification = function(options) {
  return function (req, res, next) {
    if (jwt.verify(req.query.token, options.token.getSecret()).id === options.token.getId()){
      next();
    } else {
      res.sendStatus(401);
    }
  }
};