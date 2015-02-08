(function() {
    var app = angular.module('gridFox', ['agCanvas']);
    
    app.controller('mainController', ['$scope', 'agCanvasService', function($scope, agCanvasService) {
        var self = this;
        
        agCanvasService.init("mainCanvas");
        
        var canvasSettings = agCanvasService.getCanvasSettings();
        var imageAlterations = agCanvasService.getImageAlterations();
        
        if (imageAlterations)
        {
            self.gridMode = imageAlterations.gridMode;
        }
        else
        {
            self.gridMode = "";
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
        
        function refreshGridLineCounts()
        {
            self.gridLinesX = agCanvasService.getImageAlterations().gridLinesX;
            self.gridLinesY = agCanvasService.getImageAlterations().gridLinesY;
        }
        
        refreshGridLineCounts();
        
        self.incGridX = function()
        {
            agCanvasService.incGridX();
            self.setGridMode('custom');
            refreshGridLineCounts();
        };
        
        self.decGridX = function()
        {
            agCanvasService.decGridX();
            self.setGridMode('custom');
            refreshGridLineCounts();
        };
        
        self.incGridY = function()
        {
            agCanvasService.incGridY();
            self.setGridMode('custom');
            refreshGridLineCounts();
        };
        
        self.decGridY = function()
        {
            agCanvasService.decGridY();
            self.setGridMode('custom');
            refreshGridLineCounts();
        };
        
        self.setGridMode = function(gridMode)
        {
            self.gridMode = gridMode;
            agCanvasService.setGridMode(gridMode);
        };
        
        self.loadFromUrl = function()
        {
            agCanvasService.loadImageSrc(self.fromUrl);
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