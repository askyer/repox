var repoxApp = angular.module('repoxApp', ['ngRoute', 'repoxControllers']);

repoxApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/upstreams', {
            templateUrl: 'partials/upstreams.html',
            controller: 'UpstreamsCtrl'
        }).
        when('/connectors', {
            templateUrl: 'partials/connectors.html',
            controller: 'ConnectorsCtrl'
        }).
        when('/proxies', {
            templateUrl: 'partials/proxies.html',
            controller: 'ProxiesCtrl'
        }).
        when('/immediate404Rules', {
            templateUrl: 'partials/immediate404Rules.html',
            controller: 'Immediate404RulesCtrl'
        }).
        when('/expireRules', {
            templateUrl: 'partials/expireRules.html',
            controller: 'ExpireRulesCtrl'
        }).
        when('/parameters', {
            templateUrl: 'partials/parameters.html',
            controller: 'ParametersCtrl'
        }).
        otherwise({
            redirectTo: '/upstreams'
        })
}]);

repoxApp.filter('displayProxy', function () {
    return function (proxy) {
        if (!proxy) return 'No Proxy';
        var result = proxy.protocol.toLowerCase() + "://" + proxy.host;
        if (proxy.port && proxy.port != 80)
            result = result + ":" + proxy.port;
        if (proxy.name)
            result = result + "（" + proxy.name + "）";
        return result;
    }
});

var repoxControllers = angular.module('repoxControllers', []);

repoxControllers.controller('MenuCtrl', ['$scope', '$location', '$http', function ($scope, $location, $http) {
    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    $scope.activeOn = function (uri) {
        if (endsWith($location.path(), uri))
            return 'active';
        else return '';
    }

    $scope.resetMainClient = function () {
        $http.post('resetMainClient', {}).success(function () {
            alert('Main client reset.')
        })
    }
    $scope.resetProxyClients = function () {
        $http.post('resetProxyClients', {}).success(function () {
            alert('Proxy clients reset.')
        })
    }
}]);

repoxControllers.controller('UpstreamsCtrl', ['$scope', '$http', '$route', function ($scope, $http, $route) {
    $scope.upstreams = [];
    $scope.connectors = [];

    $http.get('upstreams').success(function (data) {
        $scope.connectors = data.connectors;
        $scope.upstreams = _.map(data.upstreams, function (upstream) {
            if (upstream.connector) {
                upstream.connector = _.find(data.connectors, function (el) {
                    return upstream.connector.id && el.id == upstream.connector.id
                })
            }
            return upstream;
        });
    });
    $scope.moveUp = function (repo) {
        $http.post('upstream/up?v='+repo.id, {}).success(function () {
            $route.reload();
        })
    };
    $scope.moveDown = function (repo) {
        $http.post('upstream/down?v='+repo.id, {}).success(function () {
            $route.reload();
        })
    };

    $scope.deleteRepo = function (repo) {
        $http.delete('upstream?v=' + repo.id).success(function () {
            $route.reload();
        })
    };
    $scope.toggleDisable = function (repo) {
        var method = repo.disabled ? "enable" : "disable";
        $http.put('upstream/' + method + '?v=' + repo.id, {}).success(function () {
            $route.reload();
        })
    };
    $scope.toggleMaven = function (repo) {
        repo.maven = !repo.maven;
    };
    $scope.toggleGetOnly = function (repo) {
        repo.getOnly = !repo.getOnly;
    };

    $scope.showNewRepoDialog = function () {
        $scope.newUpstream = {repo: {maven: false, getOnly: false, disabled: false, priority: 10}};
        $('#newRepoDialog').modal('show');
    };
    $scope.submitNewRepo = function () {
        $http.post('upstream?v=' + encodeURIComponent(JSON.stringify($scope.newUpstream)), {}).success(function () {
            $('#newRepoDialog').modal('hide');
            $route.reload();
        })
    };
    $scope.showEditRepoDialog = function (upstream) {
        $scope.editUpstream = upstream;
        $('#editRepoDialog').modal('show');
    };
    $scope.submitEditRepo = function () {
        $http.put('upstream?v=' + encodeURIComponent(JSON.stringify($scope.editUpstream)), {}).success(function () {
            $('#editRepoDialog').modal('hide');
            $route.reload();
        })
    }

}]);
repoxControllers.controller('ConnectorsCtrl', ['$scope', '$http', '$route', function ($scope, $http, $route) {
    $scope.proxies = [];
    $scope.connectors = [];

    $http.get('connectors').success(function (data) {
        $scope.proxies = data.proxies;
        $scope.connectors = _.map(data.connectors, function (connector) {
            if (connector.proxy) {
                connector.proxy = _.find(data.proxies, function (el) {
                    return connector.proxy.id && el.id == connector.proxy.id
                })
            }
            return connector;
        });
    });
    $scope.showNewConnectorDialog = function () {
        $scope.newConnector = {connector:{connectionTimeout: "6 seconds", connectionIdleTimeout: "10 seconds", maxConnections: 30, maxConnectionsPerHost: 20}};
        $('#newConnectorDialog').modal('show');
    };
    $scope.submitNewConnector = function () {
        $http.post('connector?v=' + encodeURIComponent(JSON.stringify($scope.newConnector)), {}).success(function () {
            $('#newConnectorDialog').modal('hide');
            $route.reload();
        })
    };
    $scope.showEditConnectorDialog = function (connector) {
        $scope.editConnector = connector;
        $('#editConnectorDialog').modal('show');
    };
    $scope.submitEditConnector = function () {
        $http.put('connector?v=' + encodeURIComponent(JSON.stringify($scope.editConnector)), {}).success(function () {
            $('#editConnectorDialog').modal('hide');
            $route.reload();
        })
    };
    $scope.deleteConnector = function (vo) {
        $http.delete('connector?v=' + vo.connector.id).success(function () {
            $route.reload();
        })
    };


}]);


repoxControllers.controller('ProxiesCtrl', ['$scope', '$http', '$route', function ($scope, $http, $route) {
    $scope.proxies = [];
    $http.get('proxies').success(function (data) {
        $scope.proxies = data;
    })
    $scope.showNewProxyDialog = function () {
        $scope.newProxy = {protocol: 'HTTP', disabled: false};
        $('#newProxyDialog').modal('show');
    };
    $scope.submitNewProxy = function () {
        $http.post('proxy?v=' + encodeURIComponent(JSON.stringify($scope.newProxy)), {}).success(function () {
            $('#newProxyDialog').modal('hide');
            $route.reload();
        })
    };
    $scope.showEditProxyDialog = function (proxy) {
        $scope.editProxy = proxy;
        $('#editProxyDialog').modal('show');
    };
    $scope.submitEditProxy = function () {
        $http.put('proxy?v=' + encodeURIComponent(JSON.stringify($scope.editProxy)), {}).success(function () {
            $('#editProxyDialog').modal('hide');
            $route.reload();
        })
    }
    $scope.deleteProxy = function (proxy) {
        $http.delete('proxy?v=' + proxy.id).success(function () {
            $route.reload();
        })
    };
    $scope.toggleDisable = function (proxy) {
        var method = proxy.disabled ? "enable" : "disable";
        $http.put('proxy/' + method + '?v=' + proxy.id, {}).success(function () {
            $route.reload();
        })
    };
}]);
repoxControllers.controller('Immediate404RulesCtrl', ['$scope', '$http', '$route', function ($scope, $http, $route) {
    $scope.rules = [];
    $http.get('immediate404Rules').success(function (data) {
        $scope.rules = data;
    });
    $scope.showNewRuleDialog = function () {
        $scope.newRule = {disabled: false};
        $('#new404RuleDialog').modal('show');
    };
    $scope.submitNewRule = function () {
        $http.post('immediate404Rule?v=' + encodeURIComponent(JSON.stringify($scope.newRule)), {}).success(function () {
            $('#new404RuleDialog').modal('hide');
            $route.reload();
        })
    };
    $scope.showEditRuleDialog = function (rule) {
        $scope.editRule = rule;
        $('#edit404RuleDialog').modal('show');
    };
    $scope.submitEditRule = function () {
        $http.put('immediate404Rule?v=' + encodeURIComponent(JSON.stringify($scope.editRule)), {}).success(function () {
            $('#edit404RuleDialog').modal('hide');
            $route.reload();
        })
    };
    $scope.deleteRule = function (rule) {
        $http.delete('immediate404Rule?v=' + rule.id).success(function () {
            $route.reload();
        })
    };
    $scope.toggleDisable = function (rule) {
        var method = rule.disabled ? "enable" : "disable";
        $http.put('immediate404Rule/' + method + '?v=' + rule.id, {}).success(function () {
            $route.reload();
        })
    };
}]);
repoxControllers.controller('ExpireRulesCtrl', ['$scope', '$http', '$route', function ($scope, $http, $route) {
    $scope.rules = [];
    $http.get('expireRules').success(function (data) {
        $scope.rules = data;
    })
    $scope.showNewRuleDialog = function () {
        $scope.newRule = {disabled: false};
        $('#newExpireRuleDialog').modal('show');
    };
    $scope.submitNewRule = function () {
        $http.post('expireRule?v=' + encodeURIComponent(JSON.stringify($scope.newRule)), {}).success(function () {
            $('#newExpireRuleDialog').modal('hide');
            $route.reload();
        })
    };
    $scope.showEditRuleDialog = function (rule) {
        $scope.editRule = rule;
        $('#editExpireRuleDialog').modal('show');
    };
    $scope.submitEditRule = function () {
        $http.put('expireRule?v=' + encodeURIComponent(JSON.stringify($scope.editRule)), {}).success(function () {
            $('#editExpireRuleDialog').modal('hide');
            $route.reload();
        })
    };
    $scope.deleteRule = function (rule) {
        $http.delete('expireRule?v=' + rule.id).success(function () {
            $route.reload();
        })
    };
    $scope.toggleDisable = function (rule) {
        var method = rule.disabled ? "enable" : "disable";
        $http.put('expireRule/' + method + '?v=' + rule.id, {}).success(function () {
            $route.reload();
        })
    };
}]);

repoxControllers.controller('ParametersCtrl', ['$scope', '$http', '$route', function ($scope, $http, $route) {
    $scope.parameters = [];
    $http.get('parameters').success(function (data) {
        $scope.parameters = data;
    });

    $scope.showEditParameterDialog = function (parameter) {
        $scope.editParameter = parameter;
        $('#editParameterDialog').modal('show');
    };
    $scope.submitParameter = function () {
        $http.put($scope.editParameter.name+'?v=' + $scope.editParameter.value, {}).success(function () {
            $('#editParameterDialog').modal('hide');
            $route.reload();
        })
    };

}]);
