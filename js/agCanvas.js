(function() {
    var app = angular.module('agCanvas', []);

    app.factory('agCanvasService', ['$window', '$rootScope', function($window, $rootScope) {
        var imageAlterations;

        resetImageAlterations();

        var canvasSettings = {
            userWidth: 24,
            userHeight: 18
        };
        
        var imageFilters = {
            filterGrayscale: false,
            filterPosterize: false
        };

        var imageSrc = "pikachu.gif";
        
        function broadcastImageFiltersUpdated() {
            $rootScope.$broadcast("user:imageFiltersUpdated", imageFilters);
        }
        
        function saveImageFilters() {
            localStorage.setItem('imageFilters', JSON.stringify(imageFilters));
            
            broadcastImageFiltersUpdated();
        }
        
        function loadImageFilters() {
            var loadedFilters = localStorage.getItem('imageFilters');
            
            if (loadedFilters)
            {
                imageFilters = JSON.parse(loadedFilters);
                
                broadcastImageFiltersUpdated();
            }
        }

        function resetImageAlterations() {
            imageAlterations = {
                offset: {
                    x: 0,
                    y: 0
                },
                zoomFactor: 1.0,
                
                gridMode: "",
                gridLinesX: 0,
                gridLinesY: 0,
                gridLineWidth: 1,
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
                
                var image = new Image();
                
                image.onload = function()
                {
                    saveImage(image);
                };
                
                image.src = src;
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
            
            getImageFilters: function() {
                return imageFilters;
            },

            resizeCanvasRatio: function(width, height) {
                canvasSettings.userWidth = width;
                canvasSettings.userHeight = height;

                saveCanvasSettings();
            },

            saveLocal: function() {
                saveImage();
                saveImageFilters();
                saveImageAlterations();
                saveCanvasSettings();
            },

            loadLocal: function() {
                loadImage();
                loadImageFilters();
                loadCanvasSettings();
                loadImageAlterations();
            },

            loadImageSrc: function(src) {
                if (src) {
                    resetImageAlterations();

                    loadImage(src);
                }
            },
            
            setOffset: function(x, y) {
                imageAlterations.offset.x = x;
                imageAlterations.offset.y = y;
                
                saveImageAlterations();
            },
            
            adjustOffset: function(dx, dy) {
                imageAlterations.offset.x += dx;
                imageAlterations.offset.y += dy;
                
                saveImageAlterations();
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
            },
            
            toggleGrayscale: function(enabled) {
                if (enabled || enabled === false)
                {
                    imageFilters.filterGrayscale = enabled;
                }
                else
                {
                    if (imageFilters.filterGrayscale)
                    {
                        imageFilters.filterGrayscale = false;
                    }
                    else
                    {
                        imageFilters.filterGrayscale = true;
                    }
                }
                
                saveImageFilters();
            },
            
            togglePosterize: function(enabled) {
                if (enabled || enabled === false)
                {
                    imageFilters.filterPosterize = enabled;
                }
                else
                {
                    if (imageFilters.filterPosterize)
                    {
                        imageFilters.filterPosterize = false;
                    }
                    else
                    {
                        imageFilters.filterPosterize = true;
                    }
                }
                
                saveImageFilters();
            }
        };
        
        agCanvasService.loadLocal();

        return agCanvasService;
    }]);
})();