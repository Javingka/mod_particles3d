
function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};

	var fontface = parameters.hasOwnProperty("fontface") ?
		parameters["fontface"] : "Arial";

	var fontsize = parameters.hasOwnProperty("fontsize") ?
		parameters["fontsize"] : 18;

	var borderThickness = parameters.hasOwnProperty("borderThickness") ?
		parameters["borderThickness"] : 1;

	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };


	var canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 40;
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;

	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;

	// text color
	context.fillStyle = "rgba(255, 255, 255, 1.0)";
  context.lineWidth=.5;
  context.textAlign="center";
  context.strokeStyle = 'black';
  context.fillText( message, 60, 40); //borderThickness, fontsize + borderThickness);
  context.strokeText( message, 60, 40); //borderThickness, fontsize + borderThickness);
  //
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;

	var spriteMaterial = new THREE.SpriteMaterial(
		{ map: texture, fog: true  } );
	var sprite = new THREE.Sprite( spriteMaterial);
	sprite.scale.set(30,10,0);
	return sprite;
}

var XaxisTextSprites = [] ;
var YaxisTextSprites = [] ;
var ZaxisTextSprites = [] ;
function settingAxisTexts(){
  var offsetDist = externalSizeRange*.6;
  // X texts
  XaxisTextSprites[0] = makeTextSprite( axisLabels[0],
		{ fontsize: 18, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:200, b:200, a:0.8} } );
  XaxisTextSprites[0].position.set(0,offsetDist,offsetDist); //-externalSizeRange*.5,externalSizeRange*.5);
	scene.add( XaxisTextSprites[0] );

  XaxisTextSprites[1] = makeTextSprite( axisLabels[0],
		{ fontsize: 18, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:200, b:200, a:0.8} } );
  XaxisTextSprites[1].position.set(0,-offsetDist,-offsetDist); //-externalSizeRange*.5,externalSizeRange*.5);
	scene.add( XaxisTextSprites[1] );

  XaxisTextSprites[2] = makeTextSprite( axisLabels[0],
		{ fontsize: 18, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:200, b:200, a:0.8} } );
  XaxisTextSprites[2] .position.set(0,-offsetDist,offsetDist); //-externalSizeRange*.5,externalSizeRange*.5);
	scene.add( XaxisTextSprites[2] );

  XaxisTextSprites[3] = makeTextSprite( axisLabels[0],
		{ fontsize: 18, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:200, b:200, a:0.8} } );
  XaxisTextSprites[3].position.set(0,offsetDist,-offsetDist); //-externalSizeRange*.5,externalSizeRange*.5);
	scene.add( XaxisTextSprites[3] );

  // Y texts
  YaxisTextSprites[0] = makeTextSprite( axisLabels[1],
		{ fontsize: 18, borderColor: {r:0, g:255, b:0, a:1.0}, backgroundColor: {r:200, g:255, b:200, a:0.8} } );
	YaxisTextSprites[0].position.set(offsetDist, 0, offsetDist);
	scene.add( YaxisTextSprites[0] );

  YaxisTextSprites[1] = makeTextSprite( axisLabels[1],
		{ fontsize: 18, borderColor: {r:0, g:255, b:0, a:1.0}, backgroundColor: {r:200, g:255, b:200, a:0.8} } );
  YaxisTextSprites[1].position.set(-offsetDist, 0, -offsetDist);
	scene.add( YaxisTextSprites[1] );

  YaxisTextSprites[2] = makeTextSprite( axisLabels[1],
		{ fontsize: 18, borderColor: {r:0, g:255, b:0, a:1.0}, backgroundColor: {r:200, g:255, b:200, a:0.8} } );
	YaxisTextSprites[2].position.set(offsetDist, 0, -offsetDist);
	scene.add( YaxisTextSprites[2] );

  YaxisTextSprites[3] = makeTextSprite( axisLabels[1],
		{ fontsize: 18, borderColor: {r:0, g:255, b:0, a:1.0}, backgroundColor: {r:200, g:255, b:200, a:0.8} } );
	YaxisTextSprites[3].position.set(-offsetDist, 0, offsetDist);
	scene.add( YaxisTextSprites[3] );

  // Z texts
  ZaxisTextSprites[0] = makeTextSprite( axisLabels[2],
		{ fontsize: 18, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:200, g:200, b:255, a:0.8} } );
	ZaxisTextSprites[0].position.set(offsetDist,offsetDist,0);
	scene.add( ZaxisTextSprites[0] );

  ZaxisTextSprites[1] = makeTextSprite( axisLabels[2],
		{ fontsize: 18, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:200, g:200, b:255, a:0.8} } );
	ZaxisTextSprites[1].position.set(-offsetDist,-offsetDist,0);
	scene.add( ZaxisTextSprites[1] );

  ZaxisTextSprites[2] = makeTextSprite( axisLabels[2],
		{ fontsize: 18, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:200, g:200, b:255, a:0.8} } );
	ZaxisTextSprites[2].position.set(offsetDist,-offsetDist,0);
	scene.add( ZaxisTextSprites[2] );

  ZaxisTextSprites[3] = makeTextSprite( axisLabels[2],
		{ fontsize: 18, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:200, g:200, b:255, a:0.8} } );
	ZaxisTextSprites[3].position.set(-offsetDist,offsetDist,0);
	scene.add( ZaxisTextSprites[3] );
}

// Update the texts to set visible just the text stand out of the cube.
function updateAxisText(){
  setVisiblesTexts( XaxisTextSprites );
  setVisiblesTexts( YaxisTextSprites );
  setVisiblesTexts( ZaxisTextSprites );
}

function setVisiblesTexts( arrayPos ) {
  var maxDist=[]; // array to store the biggest distance between the texts and the index of those texts
  var vec2d = []; // to store the 2d position of the 3d text positions
  vec2d[0] = findHUDPosition(arrayPos[0]);
  vec2d[1] = findHUDPosition(arrayPos[1]);
  vec2d[2] = findHUDPosition(arrayPos[2]);
  vec2d[3] = findHUDPosition(arrayPos[3]);
  maxDist = [0,0,0]; // distance, index1, index2

  // compare al the distance between the four points.
  for ( var i = 3; i > 0; i--) {
    for (var j = 0; j < i ; j++) {
      var d = vec2d[i].distanceTo(vec2d[j]);
      if (d > maxDist[0]) {
        maxDist[0] = d;
        maxDist[1] = i;
        maxDist[2] = j;
      }
    }
  }
  // and set visible the points with the largest distance between them. Are going to be the positions standing outside the cube.
  for ( var i = 0 ; i < arrayPos.length; i++) {
    arrayPos[i].visible = (maxDist[1]==i||maxDist[2]==i)?true:false;
  }
}

// get the 2d screen position of the object
function findHUDPosition (obj) {
      var vector = new THREE.Vector3();
      var windowHalfX = window.innerWidth/2;
      var windowHalfY = window.innerHeight/2;

      obj.updateMatrixWorld();
      vector.setFromMatrixPosition(obj.matrixWorld);
      vector.project(camera);

      vector.x = ( vector.x * windowHalfX );
      vector.y = ( vector.y * windowHalfY );

      return vector;
};
