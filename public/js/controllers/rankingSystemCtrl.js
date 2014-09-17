angular.module('controllers').controller('RankingSystemCtrl', ['$scope', '$routeParams', 'headerHelperService', 'rankingSystemService', '$location', 'groupLevelService', 'generalService',
    function($scope, $routeParams, headerHelperService, rankingSystemService, $location, groupLevelService, generalService) {

        $scope.findOne = function() {
            rankingSystemService.get({
                rankingSystemId: $routeParams.id
            }, function(model) {
                $scope.loadRankingSystem(model);
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.positionResolutions = [
            {name: "Split Points", value:"splitPoints"},
            {name: "Same Points", value:"samePoints"}
        ];

        $scope.loadRankingSystem = function(model){
            $scope.rankingSystem = model;
            $scope.postProcess($scope.rankingSystem);
        };

        $scope.addPointDefinition = function(){
            if ($scope.rankingSystem){
                $scope.rankingSystem.pointAllotments.push({});
            } else {
                $scope.rankingSystem = {pointAllotments:[]};
                $scope.rankingSystem.pointAllotments.push({});
            }
        };

        /**
         * Loads default form fields
         */
        $scope.loadForm = function(){
        };

        $scope.postProcess = function(model) {
        };

        $scope.postProcessingCollection = function(entities){
            _.each(entities, function(entity){
                $scope.postProcess(entity);
            });
        };

        $scope.rankingSystemService = rankingSystemService;

        $scope.columnInfo = [
            {title: "Name", field:"name", baseLink:"#/rankingSystem/view/", linkField: "_id", link:true}
        ];

        $scope.create = function(){
            $scope.createRankingSystem($scope.rankingSystem);
        };

        $scope.createRankingSystem = function(rankingSystem){
            rankingSystemService.save({}, rankingSystem, function(response){
                    $location.path('rankingSystem/view/'+ response._id);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "create " + error.data.error }
                    ];
            });
        };

        $scope.copy = function(){
            var copiedSystem = _.cloneDeep($scope.rankingSystem);
            delete copiedSystem._id;
            delete copiedSystem.$resolved;
            delete copiedSystem.$promise;
            delete copiedSystem.__v;
            copiedSystem.name += " Copy";
            $scope.createRankingSystem(copiedSystem);
        };

        $scope.save = function(){
            $scope.rankingSystem.$update(function(data){
                    $scope.alerts = [
                        { type: 'success', msg: "Updated " + data.name }
                    ];
                    $scope.loadRankingSystem(data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "update " + error.data.error }
                    ];
                });
        };

        $scope.deleteEntity = function(){
            $scope.rankingSystem.$delete(function(data){
                    delete $scope.rankingSystem;
                    $scope.alerts = [
                        { type: 'success', msg: "Deleted " + data.name }
                    ];
                    $location.path('/rankingSystem');
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "delete " + error.data }
                    ];
                }
            );
        };

        $scope.loadForm();
    }
]);