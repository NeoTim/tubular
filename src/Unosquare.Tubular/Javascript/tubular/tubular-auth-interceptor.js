(function (angular, moment) {
    'use strict';

    angular.module('tubular.services')
        .factory('tubularAuthInterceptor', ['$q', '$injector', function ($q, $injector) {
            var authRequestRunning = null;
            return {

                'request': function (config) {
                    // Get the service here because otherwise, a circular dependency injection will be detected
                    var tubularHttp = $injector.get("tubularHttp");
                    var apiBaseUrl = tubularHttp.apiBaseUrl;

                    config.headers = config.headers || {};

                    if (
                        config.url.substring(0, apiBaseUrl.length) === apiBaseUrl &&
                        tubularHttp.tokenUrl != config.url &&
                        tubularHttp.useRefreshTokens &&
                        tubularHttp.requireAuthentication &&
                        tubularHttp.userData.refreshToken) {
                        
                        if (tubularHttp.isBearerTokenExpired()) {
                            // Let's force an error to automatically go directly to the refresh token stuff
                            return $q.reject({ error: 'expired token', status: 401, config: config });
                        }
                    }

                    return config;
                },

                'requestError': function (rejection) {

                    return $q.reject(rejection);
                },

                // optional method
                'response': function (response) {
                    return response;
                },

                // optional method
                'responseError': function (rejection) {
                    switch (rejection.status) {
                        case 401:
                            var tubularHttp = $injector.get("tubularHttp");
                            var apiBaseUrl = tubularHttp.apiBaseUrl;

                            var deferred = $q.defer();

                            if (
                                rejection.config.url.substring(0, apiBaseUrl.length) === apiBaseUrl &&
                                tubularHttp.tokenUrl != rejection.config.url &&
                                tubularHttp.useRefreshTokens &&
                                tubularHttp.requireAuthentication &&
                                tubularHttp.userData.refreshToken) {


                                if (!authRequestRunning) {
                                    authRequestRunning = $injector.get("$http")({
                                        method: 'POST',
                                        url: tubularHttp.refreshTokenUrl,
                                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                        data: 'grant_type=refresh_token&refresh_token=' + tubularHttp.userData.refreshToken
                                    });

                                    console.log("Getting new access token");
                                }

                                authRequestRunning.then(function (r) {
                                    authRequestRunning = null;
                                    tubularHttp.handleSuccessCallback(null, null, true, r.data);

                                    console.log("Success on getting token", r);
                                    if (tubularHttp.requireAuthentication && tubularHttp.isAuthenticated()) {
                                        $injector.get("$http")(rejection.config).then(function (resp) {
                                            deferred.resolve(resp);
                                        }, function (resp) {
                                            deferred.reject(rejection);
                                        });
                                    }
                                    else {
                                        deferred.reject(rejection);
                                    }
                                }, function (response) {
                                    console.log("Error on getting token", response);
                                    authRequestRunning = null;
                                    deferred.reject(response);
                                    tubularHttp.removeAuthentication();
                                    $injector.get("$state").go('/Login');
                                    return;
                                });

                            }
                            else {
                                deferred.reject(rejection);
                            }

                            return deferred.promise;
                            break;
                        default:
                            break;
                    }
                    return rejection || $q.when(response);
                }
            };
        }]);
})(window.angular, window.moment || null);