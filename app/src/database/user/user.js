const hasha = require('hasha');
const randomStr = require('crypto-random-string');

class User {

  constructor(login, pass) {
    this.login = login;
    this.salt = randomStr(10);
    this.pass = hasha(pass+this.salt, {options: 'sha256'});
    this.table = login;
  }

  toString() {
    return `Login: ${this.login}, PassHash: ${this.pass}, Table: ${this.table}`;
  }

}

module.exports = User;
