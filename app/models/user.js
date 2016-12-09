// app/models/user.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: String,
  password: String,
  salt: Buffer,
  admin: Boolean
});

module.exports = mongoose.model('User', UserSchema);
