var voronoi = new Voronoi();
var sites = [];
/*var raster = new Raster('lenna');
        raster.fitBounds(view.bounds, false);
        var size = new Size(50, 50);

        var colSize = raster.size / size * 1.5;
                var fullSize = size * colSize;

                //raster.visible = false;
                raster.size = size;
                for (var x = 0; x < size.width; x++) {
                    for (var y = 0; y < size.height; y++) {
                        var color = raster.getPixel(x, y);

                        var gray = (1 - color.gray) * 0.9;
                        if (gray < 0.3) {
                            var pos = new Point(x, y) * colSize + colSize / 2 * 1.5*Point.random();
                            var rectSize = 1/gray * colSize.width;
                            sites.push(pos);
                            addP(pos);
                        }
                    }
                }
                raster.size = fullSize;
        raster.sendToBack();

*/


var raster = null;
var scale = 1;
var group;
var threshold = 0.3;
var bbox, diagram;
var oldSize = view.size;
var selected = false;
var isDebug = false;
var straight = false;

sites = generateBeeHivePoints(view.size / 300, false);
var colors = new Array(sites.length);

for (var i = 0; i < colors.length; i++) {
    colors[i] = createColor(50);
};
onResize();
var count = 0;
var upCount = true;

function createColor(val) {
    return {
        hue: val * Math.random(),
        saturation: 1,
        brightness: 1,
        alpha: .6
    };;


}

function renderDiagram() {
    project.activeLayer.children = [];
    if (isDebug) {
        for (var i = sites.length - 1; i >= 0; i--) {
            addP(sites[i]);
        };
    }
    var diagram = voronoi.compute(sites, bbox);
    if (diagram) {
        for (var i = 0, l = sites.length; i < l; i++) {
            var cell = diagram.cells[sites[i].voronoiId];
            if (cell) {
                //addP(cell.site);

                var halfedges = cell.halfedges,
                    length = halfedges.length;
                if (length > 2) {
                    var points = [];
                    for (var j = 0; j < length; j++) {
                        v = halfedges[j].getEndpoint();
                        points.push(new Point(v));
                    }
                    createPath(points, sites[i], colors[i]);
                    //	 addP(sites[i]);
                }
            }
        }
    }

    var rectangle = new Path.Rectangle(10, 10, view.bounds.width - 2 * 10, view.bounds.height - 2 * 10);
    rectangle.strokeColor = "white";
    rectangle.strokeWidth = 2;

}

function addP(point) {
    var p = new Path.Circle({
        center: point,
        radius: 2,
        fillColor: 'white',
        strokeColor: 'black'
    });

}

function removeSmallBits(path) {
    var averageLength = path.length / path.segments.length;
    var min = path.length / 20;
    for (var i = path.segments.length - 1; i >= 0; i--) {
        var segment = path.segments[i];
        var cur = segment.point;
        var nextSegment = segment.next;
        var next = nextSegment.point + nextSegment.handleIn;
        if (cur.getDistance(next) < min) {
            segment.remove();
        }
    }
}

function generateBeeHivePoints(size, loose) {
    var points = [];
    var col = view.size / size;
    for (var i = -1; i < size.width + 1; i++) {
        for (var j = -1; j < size.height + 1; j++) {
            var r = 1 + Math.random() * 5;

            var point = new Point(i, j) / new Point(size) * view.size + col / 2;
           

            if (j % 2)
                point += new Point(col.width / 2, 0);
            if (loose)
                point += (col / r) * Point.random() - col / r;
            points.push(point);
        }
    }
    return points;
}

function createPath(points, center, fillColor) {
    var path = new Path();
    path.strokeColor = "white";
    path.strokeWidth = straight ? 1: 2;
    path.fillColor = fillColor;
    if (!selected) {
        //			path.fillColor = spotColor;
    } else {
        path.fullySelected = selected;
    }
    path.closed = true;
    for (var i = 0, l = points.length; i < l; i++) {
        var point = points[i];
        var next = points[(i + 1) == points.length ? 0 : i + 1];
        var vector = (next - point) / 2;
        if (straight) {
            path.add({
                point: point
            });
        } else {
            path.add({
                point: point + vector,
                handleIn: -vector,
                handleOut: vector
            });
        }

    }
    //Calculate scale

    if (!straight) {
        path.scale(0.9);
    }
    path.sendToBack();
    //removeSmallBits(path);
    return path;
}

function onResize() {
    var margin = 20;
    bbox = {
        xl: margin,
        xr: view.bounds.width - margin,
        yt: margin,
        yb: view.bounds.height - margin
    };
    for (var i = 0, l = sites.length; i < l; i++) {
        sites[i] = sites[i] * view.size / oldSize;
    }
    oldSize = view.size;

    renderDiagram();
}

function onKeyUp(event) {
    if (event.key == 'd') {
        isDebug  = !isDebug;
    }
   
    
}




function handleImage(image) {
    count = 0;
    sites = [];
    if( raster)
    {
        raster.remove();
    }
    raster = new Raster(image);
    raster.scale(0.8);
    raster.sendToBack();

    var size = new Size(40,40);
    raster.bounds = new Rectangle(0,0,view.bounds.height,view.bounds.height);
    var originalSize = new Size(raster.size.width, raster.size.height);
    var colSize = view.bounds.size / size  ;

    raster.size = size;
    for (var x = 0; x < raster.size.width; x++) 
    {
            for(var y = 0 ; y < raster.size.height ; y++)
            {
                var color = raster.getPixel(x, y);
                var gray = (1 - color.gray) * 0.9;
                if( gray > 0.85)
                {
                    var pos = new Point(x, y) * colSize + colSize / 2;
                    var rectSize = 1/gray * colSize.width;
                        console.log("rectSize " + rectSize);
                   // for(var i = 0 ; i < rectSize ; i +=15)
                    {
                        pos.x = pos.x +  Math.random()*rectSize;
                        pos.y = pos.y +  Math.random()*rectSize;

                        sites.push(pos);
                        colors.push(createColor(10));
                    }
                }

            }

    };


    raster.size = view.bounds.size;
    renderDiagram();
       raster = new Raster(image);
    raster.fitBounds(view.bounds, false);
    raster.sendToBack();


}





function onDocumentDrag(event) {
    event.preventDefault();
}

function onDocumentDrop(event) {
    event.preventDefault();

    var file = event.dataTransfer.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
        var image = document.createElement('img');
        image.onload = function() {
            handleImage(image);
            view.update();
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

DomEvent.add(document, {
    drop: onDocumentDrop,
    dragover: onDocumentDrag,
    dragleave: onDocumentDrag
});
