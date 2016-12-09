var express = require("express");
var app = express();
var restRouter = require("./routers/rest");
var redirectRouter = require("./routers/redirect");
var indexRouter = require("./routers/index");
var mongoose = require("mongoose");
var useragent = require("express-useragent");
var server = require('http').Server(app);
var io = require('socket.io')(server);

mongoose.connect("mongodb://user:user@ds155097.mlab.com:55097/tinyurl");

var redis = require("redis");
//docker会将redis container的host地址和监听端口赋值给系统变量
var host = process.env.REDIS_PORT_6379_TCP_ADDR;
var port = process.env.REDIS_PORT_6379_TCP_PORT;
var redisClient = redis.createClient(port, host);

app.use("/public", express.static(__dirname + "/public"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.use(useragent.express());

app.use("/api/v1", restRouter);

app.use("/", indexRouter);

app.use("/:shortUrl", redirectRouter);

server.listen(3000);
console.log("Server started at port 3000");

io.on('connection', function (socket) {
    socket.on('registerShortUrl', function (shortUrl) {
        redisClient.subscribe(shortUrl, function () {
            socket.shortUrl = shortUrl;
            console.log("Subscribed to " + shortUrl + " channel via redis");
        });

        redisClient.on('message', function (channel, message) {
            if (message === socket.shortUrl) {
                socket.emit('shortUrlUpdated');
            }
        })
    });

    socket.on('disconnect', function () {
        if (socket.shortUrl == null) return;
        redisClient.unsubscribe(socket.shortUrl, function () {
            console.log("Unsubscribed channel " + socket.shortUrl + " from redis");
        })
    });
});