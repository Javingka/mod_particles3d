
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




// get the 2d screen position of the object
function findHUDPosition (camera, obj) {
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
