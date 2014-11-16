angular.module('controllers').controller('FileCtrl', function($scope, $routeParams, fileService, $http) {

    $scope.findOne = function() {
        fileService.get({
            fileId: $routeParams.id
        }, function(file) {
            $scope.file = file;
            $scope.file.downloadUrl = '/file/'+ $routeParams.id + "/download";
        }, function(){
            $scope.alerts = [
                { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
            ];
        });
    };

    $scope.columnInfo = [
        {title: "File Name", field:"filename", baseLink:"#/admin/file/view/", linkField: "_id", link:true},
        {title: "Uploaded Date", field:"uploadDate", filter: "date", filterFormat: 'medium'}
    ];

    $scope.fileService = fileService;

    $scope.deleteFile = function(){
        $scope.file.$delete(function(){
                delete $scope.file;
                $scope.alerts = [
                    { type: 'success', msg: "Deleted file" }
                ];
                $location.path('/admin/file');
            },
            function(error){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to delete: " + error.data }
                ];
            }
        );
    };
});