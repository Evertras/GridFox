(function() {
    var app = angular.module('miscButtons', ['agCanvas']);
    
    app.directive('miscButtons', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/misc-buttons.html',
            controller: ['$scope', 'agCanvasService', function($scope, agCanvasService) {
                var self = this;
                
                self.saveImage = function()
                {
                    // Hacky :(
                    var dataURL = $("canvas")[0].toDataURL('image/png');
                    window.open(dataURL);
                };
                
                $scope.fileNameChanged = function()
                {
                    var file = $("#imageFile")[0].files[0];
                    var reader = new FileReader();
                    reader.onload = function() {
                        agCanvasService.loadImageSrc(reader.result);
                    };
                    reader.readAsDataURL(file);
                };
            }],
            controllerAs: 'miscButtonsCtrl'
        };
    });
})();