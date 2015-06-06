(function() {
    var app = angular.module("myapp", [
    "ngRoute",
    "ngResource",
    "pascalprecht.translate"
    ]);

    app.config(function($routeProvider, $locationProvider) {
        $routeProvider.when("/", {
            template: "Hello world"
        }).otherwise({
            redirect: "/"
        });

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
    });
})();
