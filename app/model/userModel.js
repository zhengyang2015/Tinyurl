var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    hashedPassword: String
});

var userModel = mongoose.model('UserModel', UserSchema);

module.exports = userModel;
