(function() { 
    var app = angular.module('imageToolbar', ['agCanvas']);
    
    app.directive('imageToolbar', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/image-toolbar.html',
            controller: ['$scope', 'agCanvasService', function($scope, agCanvasService) {
                var self = this;
                
                var canvasSettings = agCanvasService.getCanvasSettings();
                
                if (canvasSettings)
                {
                    self.height = canvasSettings.userHeight;
                    self.width = canvasSettings.userWidth;
                }
                else
                {
                    self.height = 18;
                    self.width = 24;
                }
                
                self.zoomIn = function()
                {
                    agCanvasService.adjustZoomFactor(0.025);
                };
                
                self.zoomOut = function()
                {
                    agCanvasService.adjustZoomFactor(-0.025);
                };
                
                self.toggleGrayscale = function()
                {
                    agCanvasService.toggleGrayscale();
                };
                
                $scope.$watch(
                    function() { return self.width; },
                    function(newValue, oldValue) {
                        agCanvasService.resizeCanvasRatio(self.width, self.height);
                    }
                );
                
                $scope.$watch(
                    function() { return self.height; },
                    function(newValue, oldValue) {
                        agCanvasService.resizeCanvasRatio(self.width, self.height);
                    }
                );
            }],
            controllerAs: 'imageToolbarCtrl'
        };
    });
})();