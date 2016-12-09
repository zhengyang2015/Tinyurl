var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlService = require("../services/urlService");
var statsService = require("../services/statsService");
var userService = require("../services/userService");

router.post("/urls", jsonParser, function (req, res) {
    var longUrl = req.body.longUrl;

    var authHeader = req.headers['authorization'];
    if (authHeader) {
        var token = getToken(authHeader);
        if (token == null) {
            res.json({});
            return;
        }
        userService.decodeToken(token, function (err, username) {
            if (err){
                console.log(err);
                res.json({});
                return;
            }
            urlService.getShortUrl(username, longUrl, function (url) {
                res.json(url);
            });
        })
    } else {
        urlService.getShortUrl("", longUrl, function (url) {
            res.json(url);
        });
    }
});

router.get("/urls/:shortUrl", function (req, res) {
    var shortUrl = req.params.shortUrl;
    urlService.getLongUrl(shortUrl, function (url) {
        if (url) {
            res.json(url);
        } else {
            res.status(404).send("Not Exist!");
        }
    });
});

router.get("/urls/:shortUrl/:info", function (req, res) {
    statsService.getUrlInfo(req.params.shortUrl, req.params.info, function (data) {
        res.json(data);
    });
});

router.get("/myUrls", jsonParser, function (req, res) {
    var authHeader = req.headers['authorization'];
    if (authHeader) {
        var token = getToken(authHeader);
        if (token == null) {
            res.json([]);
            return;
        }
        userService.decodeToken(token, function (err, username) {
            if (err) {
                console.log(err);
                res.json([]);
                return;
            }
            urlService.getMyUrls(username, function (urls) {
                res.json(urls);
            });
        });
    } else {
        res.json([]);
    }
});

router.post("/signup", jsonParser, function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    userService.signup(username, password, function (err, token) {
        if (err) {
            console.log(err);
            res.json(null);
            return;
        }
        res.json({
            username: username,
            token: token
        });
    });
});

router.post("/login", jsonParser, function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    userService.login(username, password, function (err, token) {
        if (err) {
            console.log(err);
            res.json([]);
            return;
        }
        res.json({
            username: username,
            token: token
        });
    });
});

function getToken(authHeader) {
    var splits = authHeader.split(' ');
    if (splits.length != 2) return null;
    return splits[1];
}

module.exports = router;