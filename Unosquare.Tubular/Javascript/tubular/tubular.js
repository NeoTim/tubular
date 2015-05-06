﻿(function() {
    'use strict';

    // TODO: Maybe I need to create a tubular module to move filters and constants

    /**
     * @ngdoc module
     * @name tubular.directives
     * 
     * @description 
     * Tubular Directives module. All the required directives are in this module.
     * 
     * It depends upon {@link tubular.services} and {@link tubular.models}.
     */
    angular.module('tubular.directives', ['tubular.services', 'tubular.models', 'LocalStorageModule','a8m.group-by'])
        .config([
            'localStorageServiceProvider', function (localStorageServiceProvider) {
                localStorageServiceProvider.setPrefix('tubular');

                // define console methods if not defined
                if (typeof console === "undefined") {
                    window.console = {
                        log: function () { },
                        debug: function () { },
                        error: function () { },
                        assert: function () { },
                        info: function () { },
                        warn: function () { },
                    };
                }
            }
        ])
        /**
         * @ngdoc constants
         * @name tubularConst
         *
         * @description
         * The `tubularConst` holds some UI constants.
         */
        .constant("tubularConst", {
            "upCssClass": "fa-long-arrow-up",
            "downCssClass": "fa-long-arrow-down"
        })
        /**
         * @ngdoc filter
         * @name errormessage
         *
         * @description
         * Use `errormessage` to retrieve the friendly message possible in a HTTP Error object.
         */
        .filter('errormessage', function () {
            return function (input) {
                if (angular.isDefined(input) && angular.isDefined(input.data) &&
                    input.data != null &&
                    angular.isDefined(input.data.ExceptionMessage))
                    return input.data.ExceptionMessage;

                return input.statusText || "Connection Error";
            };
        })
        /**
         * @ngdoc filter
         * @name numberorcurrency
         *
         * @description
         * `numberorcurrency` is a hack to hold `currency` and `number` in a single filter.
         */
        .filter('numberorcurrency', [
            '$filter', function ($filter) {
                return function (input, format, symbol, fractionSize) {
                    symbol = symbol || "$";
                    fractionSize = fractionSize || 2;

                    if (format === 'C') {
                        return $filter('currency')(input, symbol, fractionSize);
                    }

                    return $filter('number')(input, fractionSize);
                };
            }
        ])
        /**
         * @ngdoc filter
         * @name characters
         *
         * @description
         * `characters` filter truncates a sentence to a number of characters.
         * 
         * Based on https://github.com/sparkalow/angular-truncate/blob/master/src/truncate.js
         */ 
        .filter('characters', function () {
            return function (input, chars, breakOnWord) {
                if (isNaN(chars)) return input;
                if (chars <= 0) return '';

                if (input && input.length > chars) {
                    input = input.substring(0, chars);

                    if (!breakOnWord) {
                        var lastspace = input.lastIndexOf(' ');

                        //get last space
                        if (lastspace !== -1) {
                            input = input.substr(0, lastspace);
                        }
                    } else {
                        while (input.charAt(input.length - 1) === ' ') {
                            input = input.substr(0, input.length - 1);
                        }
                    }
                    return input + '…';
                }

                return input;
            };
        });
})();