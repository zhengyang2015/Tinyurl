var app = angular.module('tinyUrlApp');

app.controller('modalController', function ($scope, $http, $uibModalInstance, loginType) {
    $scope.errorMessage = "";

    $scope.loginType = loginType;

    $scope.ok = function () {
        if (loginType === "Sign Up") {
            var url = "/api/v1/signup";
            authenticate(url);
        } else if (loginType === "Log In"){
            var loginUrl = "/api/v1/login";
            authenticate(loginUrl);
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    function authenticate(postUrl) {
        $http.post(postUrl, {
            username: $scope.username,
            password: $scope.password //TODO: use https!!!!
        }).success(function (data) {
            if (data == null) {
                $scope.errorMessage = "* Username is not available";
            } else {
                var user = {
                    username: $scope.username,
                    token: data.token
                };
                $uibModalInstance.close(user);
            }
        })
    }
});