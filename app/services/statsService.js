var geoip = require("geoip-lite");
var RequestModel = require("../model/requestModel");

var logRequest = function (shortUrl, req) {
    var reqInfo = {};
    reqInfo.shortUrl = shortUrl;
    reqInfo.referer = req.headers.referer || "Unknown";
    reqInfo.platform = req.useragent.platform || "Unknown";
    reqInfo.browser = req.useragent.browser || "Unknown";
    //得到request的ip地址
    var ip = req.headers["x-forward-for"] || req.connection.remoteAddress
        || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    //用geoip-lite解析ip，得到地理信息
    var geo = geoip.lookup(ip);
    if (geo) {
        reqInfo.country = geo.country;
    } else {
        reqInfo.country = "Unknown";
    }
    reqInfo.timestamp = new Date();
    //将信息存到mongodb
    var request = new RequestModel(reqInfo);
    request.save();
}

var getUrlInfo = function (shortUrl, info, callback) {
    if (info == "totalClicks") {
        RequestModel.count({shortUrl: shortUrl}, function (err, data) {
            callback(data);
        });
        return;
    }

    var groupId = "";
    if (info === "hour") {
        //将groupId设置为object，包含year,month,day,hour,minutes, 就是找groupId中year,month,day,minute相同的
        //统计一个小时内的访问，就是基于minute进行分组
        groupId = {
            year: { $year: "$timestamp"},
            month: { $month: "$timestamp"},
            day: { $dayOfMonth: "$timestamp"},
            hour: { $hour: "$timestamp"},
            minutes: { $minute: "$timestamp"}
        }
    } else if (info === "day"){
        //将groupId设置为object，包含year,month,day,hour，就是找groupId中year,month,day,hour相同的
        //统计一天内的访问，就是基于hour进行分组
        groupId = {
            year: { $year: "$timestamp"},
            month: { $month: "$timestamp"},
            day: { $dayOfMonth: "$timestamp"},
            hour: { $hour: "$timestamp"}
        }
    } else if (info === "month"){
        //将groupId设置为object，包含year,month,day
        //统计一个月内的访问，就是基于day进行分组，就是找groupId中year,month,day相同的
        groupId = {
            year: { $year: "$timestamp"},
            month: { $month: "$timestamp"},
            day: { $dayOfMonth: "$timestamp"}
        }
    } else {
        groupId = "$" + info;
    }

    //利用mongodb的aggregate进行分组统计
    RequestModel.aggregate([
        {
            $match: {
                //找所有url为shortUrl的记录
                shortUrl: shortUrl
            }
        },
        {
            $sort: {
                //在上一步的基础上，根据时间排序
                timeStamp: -1
            }
        },
        {
            $group: {
                //基于groupId进行分组
                _id: groupId,
                //对每组记录进行求和
                count: { $sum: 1 }
            }
        }
    ], function (err, data) {
        callback(data);
    });
}

module.exports = {
    logRequest: logRequest,
    getUrlInfo: getUrlInfo
};