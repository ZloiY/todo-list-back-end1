const random = require('crypto-random-string');
const jwt = require('jsonwebtoken');
const Token = require('./token');

class JWT {

  constructor() {
    this.user;
    this.secret;
    this.token;
  }

  static createToken(user) {
    this.user = user;
    this.secret = random(10);
    this.token = new Token(random(32), this.user, this.setIat(1000));
  }

  static setIat(seconds) {
    return Math.floor(Date.now() / seconds);
  };

  static getJWT() {
    return jwt.sign(this.token, this.secret);
  };

  static getSecret() {
    return this.secret;
  };

  static getToken() {
    return this.token;
  };

}

module.exports = JWT;
