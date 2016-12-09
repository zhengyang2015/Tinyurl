var bcrypt = require('bcrypt-nodejs');
var UserModel = require('../model/userModel');
var uuid = require('node-uuid');
var jwt = require('jsonwebtoken');

var redis = require("redis");
var host = process.env.REDIS_PORT_6379_TCP_ADDR;
var port = process.env.REDIS_PORT_6379_TCP_PORT;
var redisClient = redis.createClient(port, host);

var salt = bcrypt.genSaltSync(10);

var signup = function (username, password, callback) {
    bcrypt.hash(password, salt, null, function (err, hash) {
        UserModel.findOne({username: username}, function (err, user) {
            if (user) {
                callback("The username is not available", null);
            } else {
                var newUser = new UserModel({
                    username: username,
                    hashedPassword: hash
                });
                newUser.save();
                console.log(username + " has signed up");
                generateToken(username, function (token) {
                    callback(null, token);
                });
            }
        });
    });
};

var login = function (username, password, callback) {
    UserModel.findOne({username: username}, function (err, user) {
        if (user){
            bcrypt.compare(password, user.hashedPassword, function (err, res) {
                if (res){
                    //password matched
                    console.log(username + " has logged in");
                    generateToken(username, function (token) {
                        callback(null, token);
                    })
                } else {
                    callback("Oops, either username or password is not correct", null);
                }
            });
        } else {
            callback("Oops, either username or password is not correct", null);
        }
    })
};

var decodeToken = function (token, callback) {
    if (token == null) {
        callback("Token is null", null);
        return;
    }

    redisClient.get('jwtKey', function (err, secretKey) {
        if (secretKey == null) {
            callback("Secret Key is null", null);
            return;
        }
        jwt.verify(token, secretKey, function (err, decoded) {
            if (err) {
                callback("Error in verifying token", null);
                return;
            }
            var decodedUsername = decoded.username;
            if (decodedUsername == null) {
                callback("User not found", null);
                return;
            }
            console.log("Token decoded to " + decodedUsername);
            callback(null, decodedUsername);
        });
    })
};

function generateToken(username, callback) {
    redisClient.get('jwtKey', function (err, secretKey) {
        if (secretKey == null) {
            secretKey = uuid.v1();
            redisClient.set('jwtKey', secretKey);
        }

        jwt.sign({username: username}, secretKey, {expiresIn: '1h'}, function (err, token) {
            console.log("Token generated for " + username);
            callback(token);
        });
    });
}

module.exports = {
    signup: signup,
    login: login,
    decodeToken: decodeToken
};