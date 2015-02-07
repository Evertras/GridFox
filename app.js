(function() {
    var app = angular.module('artistGridder', ['agCanvas']);
    
    app.controller('mainController', ['$scope', 'agCanvasService', function($scope, agCanvasService) {
        var self = this;
        
        agCanvasService.init("mainCanvas");
        
        var canvasSettings = agCanvasService.getCanvasSettings();
        var imageAlterations = agCanvasService.getImageAlterations();
        
        if (imageAlterations)
        {
            self.drawThirds = imageAlterations.shouldDrawThirds;
        }
        else
        {
            self.drawThirds = false;
        }
        
        if (canvasSettings)
        {
            self.width = canvasSettings.userWidth;
            self.height = canvasSettings.userHeight;
        }
        else
        {
            self.width = 24;
            self.height = 18;
        }
        
        self.zoomIn = function()
        {
            agCanvasService.adjustZoomFactor(0.025);
        };
        
        self.zoomOut = function()
        {
            agCanvasService.adjustZoomFactor(-0.025);
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
        
        $scope.$watch(
            function() { return self.drawThirds; },
            function(newValue, oldValue) {
                agCanvasService.toggleDrawThirds(self.drawThirds);
            }
        );
        
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
    }]);
})();