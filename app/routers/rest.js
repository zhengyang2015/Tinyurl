var express = require("express");
//express生成一个router用于处理请求
var router = express();
//导入body-parser lib，用于提取body中的json
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlService = require("../services/urlService");
var statsService = require("../services/statsService");

//jsonParser将req中的json提取出之后再放回req的body中
//verb为post，http头为"/api/v1/urls"的请求处理
router.post("/urls", jsonParser, function (req, res) {
    var longUrl = req.body.longUrl;
    urlService.getShortUrl(longUrl, function (url) {
        res.json(url);
    });
});

router.get("/urls/:shortUrl", function (req, res) {
    var shortUrl = req.params.shortUrl;
    //url是数据库中找到的shorturl和longurl的pair
    urlService.getLongUrl(shortUrl, function (url) {
        if(url) {
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

//return一个router对象
module.exports = router;