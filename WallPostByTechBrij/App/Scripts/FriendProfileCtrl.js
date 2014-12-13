"use strict";

(function (app) {
    app.controller("FriendProfileCtrl", [
        "$scope", "$location", "identityService", "apiService", "notifierService", "$routeParams", "$rootScope", "friendService",
    function ($scope, $location, identityService, apiService, notifierService, $routeParams, $rootScope, friendService) {
        $scope.init = function () {
            if (!identityService.isLoggedIn()) {
                $scope.redirectToLogin();
            } else {
                if ($rootScope.authenticatedUser && $rootScope.authenticatedUser.id == $routeParams.id) {
                    $location.path("/account/profile").replace();
                } else {
                    var config = {
                        headers: identityService.getSecurityHeaders(),
                        params: {
                            id: $routeParams.id
                        }
                    };
                    apiService.get("/api/profile", config).success(function (data) {
                        $scope.user = data;
                        notifierService.notify({ responseType: "success", message: "Profile data fetched successfully." });
                    });
                }
            }
        }();

        $scope.addFriend = function (user) {
            if (user.isMyFriend) {
                friendService.unFriend(user).success(function () {
                    user.isMyFriend = false;
                    user.isFriendRequestedRejected = true;
                    user.isFriendActionDisabled = true;
                    notifierService.notify({ responseType: "success", "message": "Operation successfull!" });
                });
            } else {
                friendService.addFriend(user).success(function () {
                    user.isMyFriend = true;
                    user.isFriendRequestSent = true;
                    user.isFriendActionDisabled = true;
                    notifierService.notify({ responseType: "success", "message": "Operation successfull!" });
                });
            }
        };
    }
    ]);
})(_$.app);