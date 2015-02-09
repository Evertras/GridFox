(function() {
    var app = angular.module("gridCanvas", ['agCanvas']);
    
    app.directive('gridCanvas', function () { 
        return {
            restrict: 'E',
            templateUrl: 'templates/grid-canvas.html',
            controller: ['$scope', '$window', 'agCanvasService', function($scope, $window, agCanvasService) {
                var self = this;
                
                var canvas = $("canvas")[0];
                var context = canvas.getContext('2d');
                
                var isDragging = false;
                var initialMousePos = {
                    x: 0,
                    y: 0
                };
                
                var image = new Image();

                image.onload = draw;
                
                image.src = agCanvasService.getImageSrc();

                function draw() {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    
                    var imageWidth;
                    var imageHeight;
                    
                    var imageRatio = image.width / image.height;
                    var canvasRatio = canvas.width / canvas.height;
                    
                    var imageAlterations = agCanvasService.getImageAlterations();
                    
                    if (imageRatio > canvasRatio)
                    {
                        imageHeight = canvas.height;
                        imageWidth = imageHeight * imageRatio;
                    }
                    else
                    {
                        imageWidth = canvas.width;
                        imageHeight = imageWidth / imageRatio;
                    }
                    
                    imageWidth *= imageAlterations.zoomFactor;
                    imageHeight *= imageAlterations.zoomFactor;
                    var adjustedZoomFactor = canvas.width / image.width * imageAlterations.zoomFactor;
                    
                    
                    context.drawImage(image,
                        imageAlterations.offset.x * adjustedZoomFactor,
                        imageAlterations.offset.y * adjustedZoomFactor,
                        imageWidth,
                        imageHeight);
                        
                    context.lineWidth = imageAlterations.gridLineWidth;
                    
                    if (imageAlterations.gridColor == "white")
                    {
                        context.strokeStyle = "#ffffff";
                    }
                    else
                    {
                        context.strokeStyle = "#000000";
                    }
                    
                    if (imageAlterations.gridMode == "thirds")
                    {
                        drawThirds();
                    }
                    else if (imageAlterations.gridMode == "phi")
                    {
                        drawPhi();
                    }
                    else if (imageAlterations.gridMode == "custom")
                    {
                        for (var i = 0; i < imageAlterations.gridLinesX; ++i)
                        {
                            var x = canvas.width * (i + 1) / (imageAlterations.gridLinesX + 1);
                            context.beginPath();
                            context.moveTo(x, 0);
                            context.lineTo(x, canvas.height);
                            context.stroke();
                        }
                        
                        for (var i = 0; i < imageAlterations.gridLinesY; ++i)
                        {
                            var y = canvas.height * (i + 1) / (imageAlterations.gridLinesY + 1);
                            context.beginPath();
                            context.moveTo(0, y);
                            context.lineTo(canvas.width, y);
                            context.stroke();
                        }
                    }
                }
                
                function drawThirds() {
                    for (var i = 1; i < 3; ++i)
                    {
                        context.beginPath();
                        context.moveTo(canvas.width * i / 3, 0);
                        context.lineTo(canvas.width * i / 3, canvas.height);
                        context.stroke();
                        
                        context.beginPath();
                        context.moveTo(0, canvas.height * i / 3);
                        context.lineTo(canvas.width, canvas.height * i / 3);
                        context.stroke();
                    }
                }
                
                function drawPhi() {
                    var phi = 1.618;
                    var ratioMult = 1 / (phi + 1);
        
                    context.beginPath();
                    context.moveTo(ratioMult * canvas.width, 0);
                    context.lineTo(ratioMult * canvas.width, canvas.height);
                    context.stroke();
                    
                    context.beginPath();
                    context.moveTo(canvas.width - (ratioMult * canvas.width), 0);
                    context.lineTo(canvas.width - (ratioMult * canvas.width), canvas.height);
                    context.stroke();
                    
                    context.beginPath();
                    context.moveTo(0, ratioMult * canvas.height);
                    context.lineTo(canvas.width, ratioMult * canvas.height);
                    context.stroke();
                    
                    context.beginPath();
                    context.moveTo(0, canvas.height - ratioMult * canvas.height);
                    context.lineTo(canvas.width, canvas.height - ratioMult * canvas.height);
                    context.stroke();
                }
                
                function handleMouseDown(e){
                    updateMousePos(e);
                    
                    isDragging=true;
                }
            
                function handleMouseUp(e){
                  isDragging=false;
                }
            
                function handleMouseOut(e){
                  isDragging=false;
                }
                
                function updateMousePos(e)
                {
                    initialMousePos.x = parseInt(e.clientX, 10);
                    initialMousePos.y = parseInt(e.clientY, 10);
                }
            
                function handleMouseMove(e){
                  if(isDragging){
                      var imageAlterations = agCanvasService.getImageAlterations();
                      var adjustment = image.width / canvas.width / imageAlterations.zoomFactor;
                      var changeX = parseInt(e.clientX, 10) - initialMousePos.x;
                      var changeY = parseInt(e.clientY, 10) - initialMousePos.y;
                      
                      imageAlterations.offset.x += adjustment * changeX;
                      imageAlterations.offset.y += adjustment * changeY;
                      
                      updateMousePos(e);
                      
                      draw();
                      
                      //saveImageAlterations();
                  }
                }
                
                $window.onresize = function(event) {
                    var canvasSettings = agCanvasService.getCanvasSettings();
                    
                    updateSizing(canvasSettings.userWidth, canvasSettings.userHeight);
                };
                
                function updateSizing(width, height) {
                    var ratio = height / width;

                    width = $window.innerWidth * 2 / 3;
                    height = width * ratio;
                    
                    var maxHeight = $window.innerHeight * 3 / 4;
                    
                    if (height > maxHeight)
                    {
                        var multBy = maxHeight / height;
                        
                        width *= multBy;
                        height *= multBy;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    draw();
                }
                
                $scope.$on('user:imageAlterationsUpdated', function(event, data) {
                    draw();
                });
                
                $scope.$on('user:canvasSettingsUpdated', function(event, data) {
                    draw();
                });
                
                $scope.$on('user:imageSrcUpdated', function(event, data) {
                    image.src = data;
                });
            }]
        };
    });
})();