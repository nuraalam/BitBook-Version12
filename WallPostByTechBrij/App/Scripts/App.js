//var app = angular.module('myApp', ['ngResource']);
////app.controller('CalculatorController', ['$scope', function ($scope) {
////    $scope.name = 'myApp';
////    $scope.add = function () {
////        $scope.sum = $scope.firstNumber + $scope.seccondNumber;
////    };
////}
////]);

"use strict";

var _$ = _$ || {};

(function () {

    var app = _$.app = angular.module("myApp", ["ngRoute", "ngResource"]);

    app.config([
        "$routeProvider", "$locationProvider", function ($routeProvider) {
            $routeProvider.when("/", {
                redirectTo: "/account/login"
            }).when(
                    "/home", {
                        templateUrl: "Templates/Home/Index.html",
                        controller: "PostCtrl"
                    }).when(
                    "/search/:key", {
                        templateUrl: "Templates/Search/SearcResult.html",
                        controller: "UserSearchCtrl"
                    }).when(
                    "/account/login", {
                        templateUrl: "Templates/Account/Login.html",
                        controller: "LoginCtrl"
                    }).when(
                    "/account/register", {
                        templateUrl: "Templates/Account/Register.html",
                        controller: "RegisterCtrl"
                    }).when(
                    "/account/externalRegister", {
                        templateUrl: "Templates/Account/ExternalRegister.html",
                        controller: "ExternalRegisterCtrl"
                    }).when(
                    "/account/profile", {
                        templateUrl: "Templates/Account/Profile.html",
                        controller: "ProfileCtrl"
                    }).when(
                    "/account/profile/changePassword", {
                        templateUrl: "Templates/Account/ChangePassword.html",
                        controller: "PasswordManageCtrl"
                    }).when(
                    "/account/profile/edit", {
                        templateUrl: "Templates/Account/Edit.html",
                        controller: "ProfileEditCtrl"
                    }).when(
                    "/friends/requests", {
                        templateUrl: "Templates/Account/PendingFriendRequests.html",
                        controller: "PendingFriendRequestCtrl"
                    }).when(
                    "/friends/", {
                        templateUrl: "Templates/Account/Friends.html",
                        controller: "AccountFriendListCtrl"
                    }).when(
                    "/account/friends/:id", {
                        templateUrl: "Views/Home/MyProfile.cshtml",
                        controller: "FriendProfileCtrl"
                    }).when(
                    "/profile/:id", {
                        templateUrl: "Views/Home/MyProfile.cshtml",
                        controller: "FriendProfileCtrl"
                    })
                .otherwise({ redirectTo: "/" });
        }
    ]);
    app.run([
        "$rootScope", "$timeout", "$location", "identityService", "utilityService",
        function ($rootScope, $timeout, $location, identityService, utilityService) {
            var fired = false;
            $rootScope.$on("$locationChangeStart", function (event) {

                var fragment = utilityService.getFragment(),
                    externalAccessToken,
                    externalError,
                    loginUrl;

                if (fragment["/access_token"]) {
                    fragment.access_token = fragment["/access_token"];
                    event.preventDefault();
                }

                if (fired) return;
                fired = true;
                $timeout(function () { fired = false; }, 10);

                identityService.restoreSessionStorageFromLocalStorage();
                identityService.verifyStateMatch(fragment);

                if (typeof (fragment.error) !== "undefined") {
                    utilityService.cleanUpLocation();
                    $scope.redirectToLogin();

                } else if (typeof (fragment.access_token) !== "undefined") {

                    utilityService.cleanUpLocation();
                    identityService.getUserInfo(fragment.access_token).success(function (data) {

                        if (typeof (data.userName) !== "undefined" && typeof (data.hasRegistered) !== "undefined" && typeof (data.loginProvider) !== "undefined") {
                            if (data.hasRegistered) {

                                identityService.setAuthorizedUserData(data);
                                identityService.setAccessToken(fragment.access_token, false);
                                $location.path("/home");

                            } else if (typeof (sessionStorage["loginUrl"]) !== "undefined") {

                                loginUrl = sessionStorage["loginUrl"];
                                sessionStorage.removeItem("loginUrl");

                                var externalRegister = {
                                    data: data,
                                    fragment: fragment,
                                    loginUrl: loginUrl
                                };

                                sessionStorage.setItem("ExternalRegister", JSON.stringify(externalRegister));
                                $location.path("/account/externalRegister");
                            } else {
                                $location.path("/account/login");
                            }
                        } else {
                            $location.path("/account/login");
                        }
                    }).error(function () {
                        $location.path("/account/login");
                    });
                } else {
                    if (sessionStorage["accessToken"] || localStorage["accessToken"]) {
                        identityService.getUserInfo().success(function (result) {
                            if (result.userName) {
                                identityService.setAuthorizedUserData(result);
                            } else {
                                $location.path("/account/login");
                            }
                        });
                    }
                }
            });
        }
    ]);

})();