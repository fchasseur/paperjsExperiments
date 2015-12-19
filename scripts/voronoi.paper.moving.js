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
var bbox, diagram;
var oldSize = view.size;
var selected = false;
var isDebug = false;
var straight = false;

sites = generateBeeHivePoints(view.size / 100, false);
var sites2 = new Array(sites.length);
var matrix = new Array(sites.length);
for (var i = sites.length - 1; i >= 0; i--) {
    var p = new Point(100 * (Math.random() - 0.5), 100 * (Math.random() - 0.5));
    sites2[i] = sites[i];
    matrix[i] = new Point(0,0);
    if( i % 3 == 0 )
    {
        } 
    matrix[i].color = createColor(30);

}; 
randomizeMatrix();
//	console.log(sites2);


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

function randomizeMatrix()
{
    var randomCellToMove = sites2.length/ 6 +  Math.floor( Math.random() * sites2.length/2);
    console.log(randomCellToMove);
    for (var i = 0; i < randomCellToMove; i++) {
        var id =  Math.floor( Math.random() * sites2.length );
        matrix[id] = calcutateRandomPoint(sites2[id],100,100,matrix[id].color);
    };
}
function calcutateRandomPoint (startP,maxDistanceX,maxDistanceY,color) {
     var p = new Point();
     p.x = maxDistanceX * (Math.random() - 0.5);
    if ((p.x + startP.x < 0) || (p.x + startP.x > view.bounds.width)) {
        p.x *= -1;
    }

    p.y = maxDistanceY * (Math.random() - 0.5);
    if ((p.y + startP.y < 0) || (p.y + startP.Y > view.bounds.height)) {
        p.y *= -1;
    }
    p.color = color;
    return p;
}

function onFrame(event) {
    if (event.count % 4 == 0) {
        count += 0.5;
        if (count > 100) {


            for (var i = sites2.length - 1; i >= 0; i--) {
                sites2[i] = sites2[i] + matrix[i];
               matrix[i].x = matrix[i].y = 0 ; 
            }
          randomizeMatrix();

            count = 0;
        } else {
            for (var i = sites.length - 1; i >= 0; i--) {
                sites[i] = sites2[i] + matrix[i] * (count / 100.0);
            };
        }
        renderDiagram();
    }
}



function renderDiagram() {
    project.activeLayer.children = [];
    if (isDebug) {
        for (var i = sites2.length - 1; i >= 0; i--) {
            var line = new Path.Line(sites2[i], sites2[i] + matrix[i]);
            line.strokeColor = 'lightGray';
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
                    createPath(points, sites[i], matrix[i].color);
                    //	 addP(sites[i]);
                }
            }
        }
    }

    var rectangle = new Path.Rectangle(10, 10, view.bounds.width - 2 * 10, view.bounds.height - 2 * 10);
    rectangle.strokeColor = "white";
    rectangle.strokeWidth = 2;

    //	raster.sendToBack();
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
    path.strokeWidth = straight ? 9 : 2;
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
    //addP(point);
    //Calculate scale

    if (!straight) {
        path.scale(0.88);
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

function onMouseDown(event) {
    onMouseDrag(event);
}

function onMouseDrag(event) {
    tool.minDistance = 40;
    sites.push(event.point);
    sites2.push(event.point);
    matrix.push(Point.random() * 30);
    matrix[matrix.length - 1].color = createColor(10);
    var i=matrix.length - 1;
    matrix[i].x = 200 * (Math.random() - 0.5);
    if ((matrix[i].x + sites2[i].x < 0) || (matrix[i].x + sites2[i].x > view.bounds.width)) {
        matrix[i].x *= -1;
    }

    matrix[i].y = 200 * (Math.random() - 0.5);
    if ((matrix[i].y + sites2[i].y < 0) || (matrix[i].y + sites2[i].Y > view.bounds.height)) {
        matrix[i].y *= -1;
    }

}

function onKeyUp(event) {
    if (event.key == 'd') {
        isDebug  = !isDebug;
    }
     if (event.key == 's') {
        straight  = !straight;
        console.log("straight = " +straight);
    }
}