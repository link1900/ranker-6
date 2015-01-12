angular.module('core').config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl : '/views/rankings.html'
        })
        .when('/greyhound/edit/:id', {
            templateUrl : '/ranker/greyhound/greyhoundEditForm.html'
        })
        .when('/greyhound/view/:id', {
            templateUrl : '/ranker/greyhound/greyhoundView.html'
        })
        .when('/greyhound/create', {
            templateUrl : '/ranker/greyhound/greyhoundCreateForm.html'
        })
        .when('/greyhound', {
            templateUrl : '/ranker/greyhound/greyhound.html'
        })
        .when('/greyhound/import', {
            templateUrl : '/ranker/greyhound/greyhoundUpload.html'
        })
        .when('/race/create', {
            templateUrl : '/views/race/raceCreate.html'
        })
        .when('/race/edit/:id', {
            templateUrl : '/views/race/raceEdit.html'
        })
        .when('/race/view/:id', {
            templateUrl : '/views/race/raceView.html'
        })
        .when('/race', {
            templateUrl : '/views/race/race.html'
        })
        .when('/rankingSystem/create', {
            templateUrl : '/ranker/rankingSystem/rankingSystemCreate.html'
        })
        .when('/rankingSystem/edit/:id', {
            templateUrl : '/ranker/rankingSystem/rankingSystemEdit.html'
        })
        .when('/rankingSystem/view/:id', {
            templateUrl : '/ranker/rankingSystem/rankingSystemView.html'
        })
        .when('/rankingSystem', {
            templateUrl : '/ranker/rankingSystem/rankingSystem.html'
        })
        .when('/groupLevel/create', {
            templateUrl : '/views/groupLevel/groupLevelCreate.html'
        })
        .when('/groupLevel/edit/:id', {
            templateUrl : '/views/groupLevel/groupLevelEdit.html'
        })
        .when('/groupLevel/view/:id', {
            templateUrl : '/views/groupLevel/groupLevelView.html'
        })
        .when('/groupLevel', {
            templateUrl : '/views/groupLevel/groupLevel.html'
        })
        .when('/batch', {
            templateUrl : '/ranker/batch/batch.html'
        })
        .when('/batch/view/:id', {
            templateUrl : '/ranker/batch/batchView.html'
        })
        .when('/batchResult/view/:id', {
            templateUrl : '/ranker/batch/batchResultView.html'
        })
        .when('/file', {
            templateUrl : '/ranker/file/file.html'
        })
        .when('/file/view/:id', {
            templateUrl : '/ranker/file/fileView.html'
        })
        .when('/data', {
            templateUrl : '/ranker/admin/data.html'
        })
        .otherwise({
            redirectTo : '/'
        });
});