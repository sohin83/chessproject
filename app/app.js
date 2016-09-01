'use strict';

// declare modules
angular.module('Authentication', []);
angular.module('Home', []);

var app = angular.module('chessapp', [
    'Authentication',
	'ui.bootstrap',
	'ngAnimate',
    'Home',
    'ngRoute',
    'ngCookies',
	
])

.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/login', {
            controller: 'LoginController',
            templateUrl: 'partials/login.html'
        })

        .when('/', {
            controller: 'topPlayersCtrl',
            templateUrl: 'partials/topplayers.html'
        })
		.when('/matches', {
            controller: 'matchesCtrl',
            templateUrl: 'partials/matches.html'
        })
		.when('/players', {
            controller: 'playersCtrl',
            templateUrl: 'partials/players.html'
        })
		.when('/rules', {
			templateUrl: 'partials/rules.html',      
		})
        .otherwise({ redirectTo: '/login' });
}])

.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if (!$rootScope.globals.currentUser) {
				if($location.path()== '/players'){
					$location.path('/login');
				}
            }
        });
    }]);
