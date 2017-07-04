exports.saltGen = function () {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUWXYZ0123456789abcdefghijklmnopqrstuwxyz';
  for (let charId = 0; charId < 10; charId += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};