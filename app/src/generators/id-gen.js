
exports.idGen = function () {
  let text = '';
  const possible = 'abcdef0123456789';
  for (let charId = 0; charId < 32; charId += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};