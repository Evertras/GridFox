(function() {
    var app = angular.module('gridToolbar', ['agCanvas']);
    
    app.directive('gridToolbar', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/grid-toolbar.html',
            controller: ['agCanvasService', function(agCanvasService) {
                var self = this;
                
                var imageAlterations = agCanvasService.getImageAlterations();
        
                if (imageAlterations)
                {
                    self.gridMode = imageAlterations.gridMode;
                }
                else
                {
                    self.gridMode = "";
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
                    self.gridLineWidth = agCanvasService.getImageAlterations().gridLineWidth;
                    self.gridColor = agCanvasService.getImageAlterations().gridColor;
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
                
                self.incGridWidth = function()
                {
                    agCanvasService.incGridWidth();
                    refreshGridLineCounts();
                };
                
                self.decGridWidth = function()
                {
                    agCanvasService.decGridWidth();
                    refreshGridLineCounts();
                };
                
                self.setGridMode = function(gridMode)
                {
                    self.gridMode = gridMode;
                    agCanvasService.setGridMode(gridMode);
                };
                
                self.setGridColor = function(gridColor)
                {
                    self.gridColor = gridColor;
                    agCanvasService.setGridColor(gridColor);
                };
            }],
            controllerAs: 'gridToolbarCtrl'
        };
    });
})();