var app = angular.module("tinyUrlApp", ["ngRoute", "ngResource", "chart.js"]);

//route管所有和url相关的
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "./public/views/home.html",
            controller: "homeController"
        })
        .when("/urls/:shortUrl", {
            templateUrl: "./public/views/url.html",
            controller: "urlController"
        })
});