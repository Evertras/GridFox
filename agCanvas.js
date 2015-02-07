(function(){
    var app = angular.module('agCanvas', []);
    
    app.factory('agCanvasService', ['$window', function($window) {
        var canvas;
        var context;
        var canvasOffset;
        
        var isDragging = false;
        var initialMousePos = {
            x: 0,
            y: 0
        };
        
        var imageAlterations;
        
        resetImageAlterations();
        
        var canvasSettings = {
            userWidth: 24,
            userHeight: 18
        };
        
        var image = new Image();
        
        image.onload = function() {
            saveImage();
            draw();
        };
        
        function draw() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            
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
            
            context.drawImage(image,
                imageAlterations.offset.x * adjustedZoomFactor,
                imageAlterations.offset.y * adjustedZoomFactor,
                imageWidth,
                imageHeight);
            
            if (imageAlterations.shouldDrawThirds)
            {
                drawThirds();
            }
        }
        
        function drawThirds() {
            context.beginPath();
            
            for (var i = 1; i < 3; ++i)
            {
                context.moveTo(canvas.width * i / 3, 0);
                context.lineTo(canvas.width * i / 3, canvas.height);
                context.stroke();
                
                context.moveTo(0, canvas.height * i / 3);
                context.lineTo(canvas.width, canvas.height * i / 3);
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
        }
        
        function updateMousePos(e)
        {
            initialMousePos.x = parseInt(e.clientX, 10);
            initialMousePos.y = parseInt(e.clientY, 10);
        }
    
        function handleMouseMove(e){
          if(isDragging){
              var adjustment = image.width / canvas.width / imageAlterations.zoomFactor;
              var changeX = parseInt(e.clientX, 10) - initialMousePos.x;
              var changeY = parseInt(e.clientY, 10) - initialMousePos.y;
              
              imageAlterations.offset.x += adjustment * changeX;
              imageAlterations.offset.y += adjustment * changeY;
              
              updateMousePos(e);
              
              draw();
              
              saveImageAlterations();
          }
        }
        
        function resetImageAlterations()
        {
            imageAlterations = {
                offset: {
                    x: 0,
                    y: 0
                },
                shouldDrawThirds: false,
                zoomFactor: 1.0
            };
        }
        
        function saveImageAlterations()
        {
            localStorage.setItem('imageAlterations', JSON.stringify(imageAlterations));
        }
        
        function loadImageAlterations()
        {
            var loadedAlterations = localStorage.getItem('imageAlterations');
            
            if (loadedAlterations)
            {
                imageAlterations = JSON.parse(loadedAlterations);
                draw();
            }
        }
        
        function saveImage()
        {
            var tempCanvas = document.createElement("canvas");
            tempCanvas.width = image.width;
            tempCanvas.height = image.height;

            var ctx = tempCanvas.getContext("2d");
            ctx.drawImage(image, 0, 0);

            var dataURL = tempCanvas.toDataURL("image/png");
        
            dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
            localStorage.setItem('image', dataURL);
        }
        
        function loadImage()
        {
            var loadedImage = localStorage.getItem('image');
            
            if (loadedImage)
            {
                image.src = loadedImage;
            }
            else
            {
                image.src = "pikachu.gif";
            }
        }
        
        function saveCanvasSettings()
        {
            localStorage.setItem('canvasSettings', JSON.stringify(canvasSettings));
        }
        
        function loadCanvasSettings()
        {
            var loadedCanvasSettings = localStorage.getItem('canvasSettings');
            
            if (loadedCanvasSettings)
            {
                canvasSettings = JSON.parse(loadedCanvasSettings);
                
                agCanvasService.resizeCanvasRatio(canvasSettings.userWidth, canvasSettings.userHeight);
            }
        }
        
        $window.onresize = function(event) {
            agCanvasService.resizeCanvasRatio(canvasSettings.userWidth, canvasSettings.userHeight);
        };
        
        var agCanvasService = {
            init: function(canvasID) {
                var jqCanvas = $("#" + canvasID);
                canvas = jqCanvas[0];
                context = canvas.getContext("2d");
                
                jqCanvas.mousedown(function(e){handleMouseDown(e);});
                jqCanvas.mousemove(function(e){handleMouseMove(e);});
                jqCanvas.mouseup(function(e){handleMouseUp(e);});
                jqCanvas.mouseout(function(e){handleMouseOut(e);});
                
                canvasOffset = jqCanvas.offset();
                
                this.loadLocal();
            },
            
            toggleDrawThirds: function(shouldDraw) {
                if (shouldDraw == null)
                {
                    imageAlterations.shouldDrawThirds = !imageAlterations.shouldDrawThirds;
                }
                else
                {
                    imageAlterations.shouldDrawThirds = shouldDraw;
                }
                
                saveImageAlterations();
                
                draw();
            },
            
            adjustZoomFactor: function(adjustBy) {
                if (imageAlterations.zoomFactor)
                {
                    imageAlterations.zoomFactor += adjustBy;
                }
                else
                {
                    imageAlterations.zoomFactor = 1.0 + adjustBy;
                }
                
                saveImageAlterations();
                
                draw();
            },
            
            getCanvasSettings: function () {
                return canvasSettings;
            },
            
            getImageAlterations: function () {
                return imageAlterations;
            },
            
            resizeCanvasRatio: function(width, height) {
                var ratio = height / width;
                
                canvasSettings.userWidth = width;
                canvasSettings.userHeight = height;
                
                saveCanvasSettings();

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
            },
            
            saveLocal: function() {
                saveImage();
                saveImageAlterations();
                saveCanvasSettings();
            },
            
            loadLocal: function() {
                loadCanvasSettings();
                loadImage();
                loadImageAlterations();
                
                this.resizeCanvasRatio(canvasSettings.userWidth, canvasSettings.userHeight);
                
                draw();
            },
            
            loadImageSrc: function (src) {
                resetImageAlterations();
                image.src = src;
            }
        };
        
        return agCanvasService;
    }]);
})();