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
        
        image.setAttribute('crossOrigin', 'anonymous');
        image.onload = saveAndDraw;
        
        function saveAndDraw() {
            saveImage();
            draw();
        }
        
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
                gridMode: "",
                zoomFactor: 1.0,
                gridLinesX: 0,
                gridLinesY: 0,
                gridLineWidth: 1
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

            var dataURL = tempCanvas.toDataURL("image/jpg");
        
            dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
            
            console.log("size before: " + dataURL.length);
            
            //var compressed = LZString.compressToUTF16(dataURL);
            
            //console.log('size after: ' + compressed.length);
            
            try {
                localStorage.setItem('image', dataURL);
            }
            catch (error)
            {
                console.log("Error when saving: " + error);
                localStorage.clear();
            }
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
            
            setGridMode: function(gridMode) {
                imageAlterations.gridMode = gridMode;
                
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
                if (src)
                {
                    resetImageAlterations();
                    image.src = src;
                }
            },
            
            incGridX: function() {
                if (imageAlterations.gridLinesX == null)
                {
                    imageAlterations.gridLinesX = 0;
                }

                imageAlterations.gridLinesX++;
                
                saveImageAlterations();
                
                draw();
            },
            
            decGridX: function() {
                if (imageAlterations.gridLinesX == null || imageAlterations.gridLinesX <= 0)
                {
                    imageAlterations.gridLinesX = 0;
                }
                else
                {
                    imageAlterations.gridLinesX--;
                }
                
                saveImageAlterations();
                
                draw();
            },
            
            incGridY: function() {
                if (imageAlterations.gridLinesY == null)
                {
                    imageAlterations.gridLinesY = 0;
                }

                imageAlterations.gridLinesY++;
                
                saveImageAlterations();
                
                draw();
            },
            
            decGridY: function() {
                if (imageAlterations.gridLinesY == null || imageAlterations.gridLinesY <= 0)
                {
                    imageAlterations.gridLinesY = 0;
                }
                else
                {
                    imageAlterations.gridLinesY--;
                }
                
                saveImageAlterations();
                
                draw();
            },
            
            incGridWidth: function() {
                if (imageAlterations.gridLineWidth == null)
                {
                    imageAlterations.gridLineWidth = 0;
                }
                
                imageAlterations.gridLineWidth++;
                
                saveImageAlterations();
                
                draw();
            },
            
            decGridWidth: function() {
                if (imageAlterations.gridLineWidth == null || imageAlterations.gridLineWidth <= 1)
                {
                    imageAlterations.gridLineWidth = 1;
                }
                else
                {
                    imageAlterations.gridLineWidth--;
                }
                
                saveImageAlterations();
                
                draw();
            },
            
            setGridColor: function(gridColor) {
                imageAlterations.gridColor = gridColor;
                
                saveImageAlterations();
                
                draw();
            }
        };
        
        return agCanvasService;
    }]);
})();