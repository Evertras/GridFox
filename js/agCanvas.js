(function() {
    var app = angular.module('agCanvas', []);

    app.factory('agCanvasService', ['$window', '$rootScope', function($window, $rootScope) {
        var imageAlterations;

        resetImageAlterations();

        var canvasSettings = {
            userWidth: 24,
            userHeight: 18
        };

        var imageSrc = "pikachu.gif";

        function resetImageAlterations() {
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
            
            broadcastImageAlterationsUpdated();
        }

        function broadcastImageAlterationsUpdated() {
            $rootScope.$broadcast("user:imageAlterationsUpdated", imageAlterations);
        }

        function saveImageAlterations() {
            localStorage.setItem('imageAlterations', JSON.stringify(imageAlterations));

            broadcastImageAlterationsUpdated();
        }

        function loadImageAlterations() {
            var loadedAlterations = localStorage.getItem('imageAlterations');

            if (loadedAlterations) {
                imageAlterations = JSON.parse(loadedAlterations);

                broadcastImageAlterationsUpdated();
            }
        }

        function saveImage(image) {
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
            catch (error) {
                console.log("Error when saving: " + error);
                localStorage.clear();
            }
        }

        function broadcastImageSrcUpdated() {
            $rootScope.$broadcast("user:imageSrcUpdated", imageSrc);
        }

        function loadImage(src) {
            if (src) {
                imageSrc = src;
                
                saveImage(src);
            }
            else {
                var loadedImage = localStorage.getItem('image');

                if (loadedImage) {
                    imageSrc = loadedImage;
                }
                else {
                    imageSrc = "pikachu.gif";
                }
            }

            broadcastImageSrcUpdated();
        }

        function broadcastCanvasSettingsUpdated() {
            $rootScope.$broadcast("user:canvasSettingsUpdated", imageAlterations);
        }

        function saveCanvasSettings() {
            localStorage.setItem('canvasSettings', JSON.stringify(canvasSettings));

            broadcastCanvasSettingsUpdated();
        }

        function loadCanvasSettings() {
            var loadedCanvasSettings = localStorage.getItem('canvasSettings');

            if (loadedCanvasSettings) {
                canvasSettings = JSON.parse(loadedCanvasSettings);

                broadcastCanvasSettingsUpdated();
            }
        }

        var agCanvasService = {
            setGridMode: function(gridMode) {
                imageAlterations.gridMode = gridMode;

                saveImageAlterations();
            },

            adjustZoomFactor: function(adjustBy) {
                if (imageAlterations.zoomFactor) {
                    imageAlterations.zoomFactor += adjustBy;
                }
                else {
                    imageAlterations.zoomFactor = 1.0 + adjustBy;
                }

                saveImageAlterations();
            },

            getCanvasSettings: function() {
                return canvasSettings;
            },

            getImageAlterations: function() {
                return imageAlterations;
            },

            resizeCanvasRatio: function(width, height) {
                canvasSettings.userWidth = width;
                canvasSettings.userHeight = height;

                saveCanvasSettings();
            },

            saveLocal: function() {
                saveImage();
                saveImageAlterations();
                saveCanvasSettings();
            },

            loadLocal: function() {
                loadImage();
                loadCanvasSettings();
                loadImageAlterations();
            },

            loadImageSrc: function(src) {
                if (src) {
                    resetImageAlterations();

                    loadImage(src);
                }
            },
            
            getImageSrc: function() {
                if (imageSrc)
                {
                    return imageSrc;
                }
                
                return "pikachu.gif";
            },

            incGridX: function() {
                if (imageAlterations.gridLinesX == null) {
                    imageAlterations.gridLinesX = 0;
                }

                imageAlterations.gridLinesX++;

                saveImageAlterations();
            },

            decGridX: function() {
                if (imageAlterations.gridLinesX == null || imageAlterations.gridLinesX <= 0) {
                    imageAlterations.gridLinesX = 0;
                }
                else {
                    imageAlterations.gridLinesX--;
                }

                saveImageAlterations();
            },

            incGridY: function() {
                if (imageAlterations.gridLinesY == null) {
                    imageAlterations.gridLinesY = 0;
                }

                imageAlterations.gridLinesY++;

                saveImageAlterations();
            },

            decGridY: function() {
                if (imageAlterations.gridLinesY == null || imageAlterations.gridLinesY <= 0) {
                    imageAlterations.gridLinesY = 0;
                }
                else {
                    imageAlterations.gridLinesY--;
                }

                saveImageAlterations();
            },

            incGridWidth: function() {
                if (imageAlterations.gridLineWidth == null) {
                    imageAlterations.gridLineWidth = 0;
                }

                imageAlterations.gridLineWidth++;

                saveImageAlterations();
            },

            decGridWidth: function() {
                if (imageAlterations.gridLineWidth == null || imageAlterations.gridLineWidth <= 1) {
                    imageAlterations.gridLineWidth = 1;
                }
                else {
                    imageAlterations.gridLineWidth--;
                }

                saveImageAlterations();
            },

            setGridColor: function(gridColor) {
                imageAlterations.gridColor = gridColor;

                saveImageAlterations();
            }
        };
        
        agCanvasService.loadLocal();

        return agCanvasService;
    }]);
})();