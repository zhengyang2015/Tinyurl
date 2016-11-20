/**
 * 用于处理所有service，如shortURL->longURL，longURL->shortURL
*/
//用于存储数据
var urlModel = require("../model/urlModel");
var redis = require("redis");
//docker会将redis container的host地址和监听端口赋值给系统变量
var host = process.env.REDIS_PORT_6379_TCP_ADDR;
var port = process.env.REDIS_PORT_6379_TCP_PORT;

var redisClient = redis.createClient(port, host);

var encode = [];
var getCharArray = function (charA, charB) {
    var arr = [];
    var i = charA.charCodeAt(0);
    var j = charB.charCodeAt(0);

    for(; i <= j; i++) {
        arr.push(String.fromCharCode(i));
    }
    return arr;
}

encode = encode.concat(getCharArray("A", "B"));
encode = encode.concat(getCharArray("a", "b"));
encode = encode.concat(getCharArray("0", "9"));

var getShortUrl = function (longUrl, callback) {
    if ( longUrl.indexOf("http") === -1) {
        longUrl = "http://" + longUrl;
    }

    //若在redis缓存中存在，则从redis中直接读取
    redisClient.get(longUrl, function (err, shortUrl) {
        if (shortUrl) {
            callback({
                shortUrl: shortUrl,
                longUrl: longUrl
            });
        } else {
            //若在redis中不存在，则去数据库中找，异步IO
            urlModel.findOne({longUrl: longUrl}, function (err, data) {
                if (data) {
                    callback(data);
                    //从数据库中读取之后，要在redis缓存中也存一份
                    redisClient.set(data.shortUrl, data.longUrl);
                    redisClient.set(data.longUrl, data.shortUrl);
                } else {
                    generateShortUrl(function (shortUrl) {
                        var url = new urlModel({
                            shortUrl: shortUrl,
                            longUrl: longUrl
                        });
                        url.save();
                        redisClient.set(shortUrl, longUrl);
                        redisClient.set(longUrl, shortUrl);
                        callback(url);
                    });
                }
            });
        }
    })
};

var generateShortUrl = function (callback) {
    //count数数据库里有多少个元素,{}中可以设置匹配条件
    urlModel.count({}, function (err, data) {
        callback(convert62(data));
    });
}

var convert62 = function (num) {
    var shortUrl = "";
    do {
        shortUrl = encode[num % 62] + shortUrl;
        num = Math.floor(num / 62);
    } while(num != 0)
    return shortUrl;
}

var getLongUrl = function (shortUrl, callback) {
    redisClient.get(shortUrl, function (err, longUrl) {
        if (longUrl) {
            callback({
                shortUrl: shortUrl,
                longUrl: longUrl
            });
        } else {
            urlModel.findOne({shortUrl: shortUrl}, function (err, data) {
                callback(data);
                if (data) {
                    redisClient.set(data.shortUrl, data.longUrl);
                    redisClient.set(data.longUrl, data.shortUrl);
                }
            })
        }
    });
}

//定义不同function的返回
module.exports={
    getShortUrl: getShortUrl,
    getLongUrl: getLongUrl
}
