(function() {
    var app = angular.module("gridCanvas", ['agCanvas']);
    
    app.directive('gridCanvas', function () { 
        return {
            restrict: 'E',
            templateUrl: 'templates/grid-canvas.html',
            controller: ['$scope', '$window', 'agCanvasService', function($scope, $window, agCanvasService) {
                var self = this;
                
                var canvas = $("#mainCanvas")[0];
                var camanCanvas = $("#camanCanvas")[0];
                var context = canvas.getContext('2d');
                var camanContext = camanCanvas.getContext('2d');
                var colorViewerCanvas = $("#colorViewerCanvas")[0];
                var colorViewerContext = colorViewerCanvas.getContext('2d');
                
                var isDragging = false;
                var initialMousePos = {
                    x: 0,
                    y: 0
                };
                
                var image = new Image();

                image.onload = function() {
                    // reloadCanvasData was giving weird errors, this is hacky but it should work
                    $(camanCanvas).removeAttr("data-caman-id");

                    updateSizing();
                    renderImage();
                };
                
                image.src = agCanvasService.getImageSrc();
                
                canvas.onmousedown = handleMouseDown;
                canvas.onmouseup = handleMouseUp;
                canvas.onmousemove = handleMouseMove;
                canvas.onmouseout = handleMouseOut;
                canvas.onmouseover = handleMouseOver;
                
                // Stolen from CamanJS documentation
                Caman.Filter.register("posterize", function (adjust) {
                  // Pre-calculate some values that will be used
                  var numOfAreas = 256 / adjust;
                  var numOfValues = 255 / (adjust - 1);
                
                  // Our process function that will be called for each pixel.
                  // Note that we pass the name of the filter as the first argument.
                  this.process("posterize", function (rgba) {
                    rgba.r = Math.floor(Math.floor(rgba.r / numOfAreas) * numOfValues);
                    rgba.g = Math.floor(Math.floor(rgba.g / numOfAreas) * numOfValues);
                    rgba.b = Math.floor(Math.floor(rgba.b / numOfAreas) * numOfValues);
                
                    // Return the modified RGB values
                    return rgba;
                  });
                });
                
                function renderImage() {
                    var imageFilters = agCanvasService.getImageFilters();

                    Caman(camanCanvas, agCanvasService.getImageSrc(), function() {
                        this.revert();
                        
                        if (imageFilters.filterPosterize)
                        {
                            this.posterize(5);
                        }

                        if (imageFilters.filterGrayscale)
                        {
                            this.greyscale();
                        }

                        this.render(function() {
                            draw();
                        });
                    });
                }
                
                function drawColorViewer(x, y)
                {
                    colorViewerContext.clearRect(0, 0, colorViewerCanvas.width, colorViewerCanvas.height);
                    
                    var pixel = context.getImageData(x, y, 1, 1).data;
                    
                    var r = pixel[0];
                    var g = pixel[1];
                    var b = pixel[2];
                    
                    colorViewerContext.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                    colorViewerContext.fillRect(0, 0, colorViewerCanvas.width, colorViewerCanvas.height);

                    var i;
                    var numValues = 5;
                    var value;
                    var xPos;
                    var width = colorViewerCanvas.width / numValues;
                    var valueStep = 255.0 / (numValues - 1);
                    
                    console.log(valueStep);
                    
                    for (i = 0; i < numValues; ++i)
                    {
                        value = Math.floor(i * valueStep);
                        xPos = i * width;
                        colorViewerContext.fillStyle = "rgb(" + value + "," + value + "," + value + ")";
                        colorViewerContext.fillRect(xPos, colorViewerCanvas.height * 2 / 3, width, colorViewerCanvas.height / 3);
                    }
                    
                    /*
                    var grd = colorViewerContext.createLinearGradient(0, 0, colorViewerCanvas.width, 0);
                    grd.addColorStop(0, '#000000');   
                    grd.addColorStop(1, '#FFFFFF');
                    colorViewerContext.fillStyle = grd;
                    colorViewerContext.fillRect(0, colorViewerCanvas.height * 2 / 3, colorViewerCanvas.width, colorViewerCanvas.height / 3);
                    */
                }

                function draw() {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    
                    var imageAlterations = agCanvasService.getImageAlterations();
                    
                    drawImage(imageAlterations);
                        
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
                        drawCustomGrid(imageAlterations.gridLinesX, imageAlterations.gridLinesY);
                    }
                }
                
                function drawImage(imageAlterations) {
                    var imageWidth;
                    var imageHeight;
                    
                    var imageRatio = image.width / image.height;
                    var canvasRatio = canvas.width / canvas.height;

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
                    
                    context.drawImage(camanCanvas,
                        imageAlterations.offset.x * adjustedZoomFactor,
                        imageAlterations.offset.y * adjustedZoomFactor,
                        imageWidth,
                        imageHeight);
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
                
                function drawCustomGrid(gridLinesX, gridLinesY) {
                    for (var i = 0; i < gridLinesX; ++i)
                    {
                        var x = canvas.width * (i + 1) / (gridLinesX + 1);
                        context.beginPath();
                        context.moveTo(x, 0);
                        context.lineTo(x, canvas.height);
                        context.stroke();
                    }

                    for (var i = 0; i < gridLinesY; ++i)
                    {
                        var y = canvas.height * (i + 1) / (gridLinesY + 1);
                        context.beginPath();
                        context.moveTo(0, y);
                        context.lineTo(canvas.width, y);
                        context.stroke();
                    }
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
                    $(colorViewerCanvas).hide();
                }
                
                function handleMouseOver(e){
                    isDragging=false;
                    $(colorViewerCanvas).show();
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
                      
                        agCanvasService.adjustOffset(adjustment * changeX, adjustment * changeY);
                      
                        updateMousePos(e);
                      
                        draw();
                    }
                    else
                    {
                        //$(colorViewerCanvas).css({
                        //    left:  e.pageX - 600,
                        //    top:   e.pageY - 150
                        //});
                        
                        drawColorViewer(e.offsetX, e.offsetY);
                    }
                }
                
                $window.onresize = function(event) {
                    var canvasSettings = agCanvasService.getCanvasSettings();
                    
                    updateSizing(canvasSettings.userWidth, canvasSettings.userHeight);
                };
                
                function updateSizing(width, height) {
                    if (!width || !height)
                    {
                        var canvasSettings = agCanvasService.getCanvasSettings();
                        
                        width = canvasSettings.userWidth;
                        height = canvasSettings.userHeight;
                    }
                    
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
                    updateSizing();
                    draw();
                });
                
                $scope.$on('user:imageSrcUpdated', function(event, data) {
                    image.src = data;
                });
                
                $scope.$on('user:imageFiltersUpdated', function(event, data) {
                    renderImage();
                });
            }],
            controllerAs: 'gridCanvasCtrl'
        };
    });
})();