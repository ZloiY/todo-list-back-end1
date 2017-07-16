class Token {

  constructor(userId, userLogin, iat) {
    this.id = userId;
    this.user = userLogin;
    this.iat = iat;
  }

  getId() {
    return this.id;
  }

  getUser() {
    return this.user;
  }

  getIat() {
    return this.iat;
  }

  toString() {
    return `Id: ${this.id}, user: ${this.user}, iat: ${this.iat}`;
  }

}

module.exports = Token;
