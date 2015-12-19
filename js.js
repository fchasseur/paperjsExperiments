$(document).ready(function(){

	if( $(window).width() < 325 )
	{
		$("#columns").css("width","100%");
	}
	
	
	$("figure img").click( function(){
		if( parseInt($(this).css("height")) != 200)
		{
			$(this).css("height","200px");
		}
		else{
			$("figure img").css("height","200px");
			$(this).css("height","auto");
		}
	});

	 	  // Create the dropdown base
      $("<select />").appendTo("nav");
      
      // Create default option "Go to..."
      $("<option />", {
         "selected": "selected",
         "value"   : "",
         "text"    : "Go to..."
      }).appendTo("nav select");
      
      // Populate dropdown with menu items
      $("nav a").each(function() {
       var el = $(this);
       $("<option />", {
           "value"   : el.attr("href"),
           "text"    : el.text()
       }).appendTo("nav select");
      });
      
	   // To make dropdown actually work
	   // To make more unobtrusive: http://css-tricks.com/4064-unobtrusive-page-changer/
      $("nav select").change(function() {
        window.location = $(this).find("option:selected").val();
      });
	 

});

function addToStorage(elemId, item)
{
	var value = $.jStorage.get("itemsILike");
	if(!value)
	{
		value = [];
	}
	var itemCount = value.length;
	value = jQuery.grep(value, function(value) {  return value.url != item.url});
	if( value.length < itemCount)
	{
		// Item is removed.
		$(elemId).css("-webkit-filter","grayscale(100%)");
	}
	else
	{
		// Item has to be added
		$(elemId).css("-webkit-filter","grayscale(0%)");
		value.push(item);
	}

	$.jStorage.set("itemsILike",value);

	return false;
}

function generateSTL(geom){
  var vertices = geom.vertices;
  var tris     = geom.faces;

  stl = "solid pixel";
  for(var i = 0; i<tris.length; i++){
    stl += ("facet normal "+stringifyVector( tris[i].normal )+" \n");
    stl += ("outer loop \n");
    stl += stringifyVertex( vertices[ tris[i].a ] );
    stl += stringifyVertex( vertices[ tris[i].b ] );
    stl += stringifyVertex( vertices[ tris[i].c ] );
    stl += ("endloop \n");
    stl += ("endfacet \n");
  }
  stl += ("endsolid");

  return stl
}

function stringifyVector(vec){
  return ""+vec.x+" "+vec.y+" "+vec.z;
}

function stringifyVertex(vec){
  return "vertex "+stringifyVector(vec)+" \n";
}

function removeDuplicateFaces(geometry){
  for(var i=0; i<geometry.faces.length; i++){
    var tri = geometry.faces[i];
    var inds = [tri.a, tri.b, tri.c, tri.d].sort();
    for(var j=0; j<i; j++){
      var tri_2 = geometry.faces[j];
      if( tri_2 !== undefined ){
        var inds_2 = [tri_2.a, tri_2.b, tri_2.c, tri_2.d].sort();
        if( isSame( inds, inds_2 ) ){
          delete geometry.faces[i];
          delete geometry.faces[j];
        }
      }
    }
  }
  geometry.faces = geometry.faces.filter( function(a){ return a!==undefined });
  return geometry;
}

function isSame(a1, a2){
  return !(a1.sort() > a2.sort() || a1.sort() < a2.sort());
}

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||navigator.msSaveBlob&&navigator.msSaveBlob.bind(navigator)||function(a){"use strict";var b=a.document,c=function(){return a.URL||a.webkitURL||a},d=a.URL||a.webkitURL||a,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),f="download"in e,g=function(c){var d=b.createEvent("MouseEvents");return d.initMouseEvent("click",!0,!1,a,0,0,0,0,0,!1,!1,!1,!1,0,null),c.dispatchEvent(d)},h=a.webkitRequestFileSystem,i=a.requestFileSystem||h||a.mozRequestFileSystem,j=function(b){(a.setImmediate||a.setTimeout)(function(){throw b},0)},k="application/octet-stream",l=0,m=[],n=function(){for(var a=m.length;a--;){var b=m[a];"string"==typeof b?d.revokeObjectURL(b):b.remove()}m.length=0},o=function(a,b,c){b=[].concat(b);for(var d=b.length;d--;){var e=a["on"+b[d]];if("function"==typeof e)try{e.call(a,c||a)}catch(f){j(f)}}},p=function(b,d){var q,r,x,j=this,n=b.type,p=!1,s=function(){var a=c().createObjectURL(b);return m.push(a),a},t=function(){o(j,"writestart progress write writeend".split(" "))},u=function(){(p||!q)&&(q=s(b)),r&&(r.location.href=q),j.readyState=j.DONE,t()},v=function(a){return function(){return j.readyState!==j.DONE?a.apply(this,arguments):void 0}},w={create:!0,exclusive:!1};return j.readyState=j.INIT,d||(d="download"),f&&(q=s(b),e.href=q,e.download=d,g(e))?(j.readyState=j.DONE,t(),void 0):(a.chrome&&n&&n!==k&&(x=b.slice||b.webkitSlice,b=x.call(b,0,b.size,k),p=!0),h&&"download"!==d&&(d+=".download"),r=n===k||h?a:a.open(),i?(l+=b.size,i(a.TEMPORARY,l,v(function(a){a.root.getDirectory("saved",w,v(function(a){var c=function(){a.getFile(d,w,v(function(a){a.createWriter(v(function(c){c.onwriteend=function(b){r.location.href=a.toURL(),m.push(a),j.readyState=j.DONE,o(j,"writeend",b)},c.onerror=function(){var a=c.error;a.code!==a.ABORT_ERR&&u()},"writestart progress write abort".split(" ").forEach(function(a){c["on"+a]=j["on"+a]}),c.write(b),j.abort=function(){c.abort(),j.readyState=j.DONE},j.readyState=j.WRITING}),u)}),u)};a.getFile(d,{create:!1},v(function(a){a.remove(),c()}),v(function(a){a.code===a.NOT_FOUND_ERR?c():u()}))}),u)}),u),void 0):(u(),void 0))},q=p.prototype,r=function(a,b){return new p(a,b)};return q.abort=function(){var a=this;a.readyState=a.DONE,o(a,"abort")},q.readyState=q.INIT=0,q.WRITING=1,q.DONE=2,q.error=q.onwritestart=q.onprogress=q.onwrite=q.onabort=q.onerror=q.onwriteend=null,a.addEventListener("unload",n,!1),r}(self);


