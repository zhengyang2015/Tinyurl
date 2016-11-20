var mongoose = require("mongoose");

var urlSchema = mongoose.Schema({
    shortUrl:String,
    longUrl:String
});

var urlModel = mongoose.model("urlModel", urlSchema);

module.exports = urlModel;
