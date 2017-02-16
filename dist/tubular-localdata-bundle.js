(function (angular) {
    'use strict';

    angular.module('tubular.services').factory('tubularLocalDataBase64', tubularLocalDataBase64);

    tubularLocalDataBase64.$inject = [];

    function tubularLocalDataBase64() {
        return {
            getFromUrl : getFromUrl
        }

        function getFromUrl(url) {
            if (url.indexOf('data:') !== 0)
                return null;

            var urlData = url.substr('data:application/json;base64,'.length);
            urlData = atob(urlData);
            return angular.fromJson(urlData);
        }

    }
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.services').factory('tubularLocalDataPager', ['filterFilter', 'orderByFilter',  function tubularLocalDataPager(filterFilter, orderByFilter) {
        return {
            page: page
        }


        function page(request, data) {
            if (data.length === 0)
                return createEmptyResponse();
            var set = data;
            var requestParams = request.data;
            set = sort(requestParams, set);
            set = filter(requestParams, set);
            set = search(requestParams, set);
            return format(requestParams, set);
        }

        function sort(request, set) {
            // Get columns with sort
            // TODO: Check SortOrder 
            var sorts = request.Columns
                .filter(function (el) { return el.SortOrder > 0; })
                .map(function (el) { return (el.SortDirection === 'Descending' ? '-' : '') + el.Name; });

            for (var sort in sorts) {
                if (sorts.hasOwnProperty(sort)) {
                    set = orderByFilter(set, sorts[sort]);
                }
            }
            return set;
        }

        function search(request, set) {
            if (request.Search && request.Search.Operator === 'Auto' && request.Search.Text) {
                var searchables = request.Columns
                    .filter(function (el) { return el.Searchable; })
                    .map(function (el) {
                        var obj = {};
                        obj[el.Name] = request.Search.Text;
                        return obj;
                    });

                if (searchables.length > 0) {
                    return filterFilter(set, function (value) {
                        var filters = reduceFilterArray(searchables);
                        var result = false;
                        angular.forEach(filters, function (filter, column) {
                            if (value[column] && value[column].toLocaleLowerCase().indexOf(filter) >= 0) {
                                result = true;
                            }
                        });

                        return result;
                    });
                }
            }
            return set;
        }

        function filter(request, set) {
            // Get filters (only Contains)
            // TODO: Implement all operators
            var filters = request.Columns
                .filter(function (el) { return el.Filter && el.Filter.Text; })
                .map(function (el) {
                    var obj = {};
                    if (el.Filter.Operator === 'Contains') {
                        obj[el.Name] = el.Filter.Text;
                    }

                    return obj;
                });

            if (filters.length > 0) {
                return filterFilter(set, reduceFilterArray(filters));
            }
            return set;
        }

        function format(request, set) {
            var response = createEmptyResponse();
            response.FilteredRecordCount = set.length;
            response.TotalRecordCount = set.length;
            response.Payload = set.slice(request.Skip, request.Take + request.Skip);
            response.TotalPages = (response.FilteredRecordCount + request.Take - 1) / request.Take;

            if (response.TotalPages > 0) {
                var shift = Math.pow(10, 0);
                var number = 1 + ((request.Skip / response.FilteredRecordCount) * response.TotalPages);

                response.CurrentPage = ((number * shift) || 0) / shift;
                if (response.CurrentPage < 1) response.CurrentPage = 1;
            }
        }

        function createEmptyResponse() {
            return {
                Counter: 0,
                CurrentPage: 1,
                FilteredRecordCount: 0,
                TotalRecordCount: 0,
                Payload: [],
                TotalPages: 0
            };
        }
        function reduceFilterArray(filters) {
            var filtersPattern = {};

            for (var i in filters) {
                if (filters.hasOwnProperty(i)) {
                    for (var k in filters[i]) {
                        if (filters[i].hasOwnProperty(k)) {
                            filtersPattern[k] = filters[i][k].toLocaleLowerCase();
                        }
                    }
                }
            }

            return filtersPattern;
        }
    }])
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularLocalData
         *
         * @description
         * Use `tubularLocalData` to connect a grid or a form to a local JSON file. This file can be 
         * stored in a BLOB as a BASE64 string.
         */
        .factory('tubularLocalData', ['tubularHttp', '$q', '$log', 'tubularLocalDataPager', 'tubularLocalDataBase64',function tubularLocalData(tubularHttp, $q, $log, pager, localDataBase64) {

        return {
            getByKey: tubularHttp.getByKey,
            get : tubularHttp.get,
            retrieveDataAsync: retrieveDataAsync
        }

        function retrieveDataAsync(request) {
            request.requireAuthentication = false;
            return {
                promise: getPromise(request),
                cancel: cancelFunc
            };

        }

        function cancelFunc(reason) {
            $log.info(reason);
            return $q.resolve(reason);
        }

        function getPromise(request) {
            return $q.resolve(getData(request)).then(function onData(data) {
                return pageRequest(request, data);
            });
        }

        function getData(request) {
            return dataFromUrl(request) || dataFromHttp(request);
        }

        function dataFromHttp(request) {
            return tubularHttp.retrieveDataAsync(request).promise;
        }

        function dataFromUrl(request){
            return localDataBase64.getFromUrl(request.serverUrl);
        }
       

        function pageRequest(request, data) {
            return pager.page(request, data);
        }
    }])
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.services').run(['tubularHttp', 'tubularLocalData', function registerAsLocal(tubularHttp, tubularLocalData) {
        tubularHttp.registerService('local', tubularLocalData);
    }])
  
})(angular);