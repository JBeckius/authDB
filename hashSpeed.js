const CRYPTO = require('crypto');
var rand = require('csprng');

var password = 'abasdoj123';
var salt = rand(130, 36);
console.time('dbtime');
var hashedPass = CRYPTO.pbkdf2(password, salt, 100000, 512, 'sha512', function(err, key) {
  console.timeEnd('dbtime');
  return key;
});
