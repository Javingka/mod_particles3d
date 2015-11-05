
//var mesh, line, pyMesh ;

//var pyramidCloud;

//var pointCloud; // bufferGeometry and mesh
/**
 * Set a new scatter 3d
 * @param {elementCount} how many elements will be rendered
 * @param {elementSize} size of the element
 * @param {color} Color or array of colors.
 * @param {listX} list of x coordinates
 * @param {listY} list of y coordinates
 * @param {listZ} list of z coordinates
 */
function Scatter3d( elementCount, geometryType, pSize, axisL, selectionMode, updating,listX, listY, listZ ) {
  this.listX = listX;
  this.listY = listY;
  this.listZ = listZ;

  this.particleCount = elementCount;
  this.particleSize = pSize;
  this.axisLabels = axisL;
  // to know when the camera is moving '' No move. or 'xy''xz''yz'
  this.cameraTransition = '';
  this.cameraTransPos = new THREE.Vector3();
  this.cameraUp = new THREE.Vector3();
  this.cameraTransAng;

  this.stats; // fps this.stats
  this.container;// DOM canvas to draw
  this.controls; // controls for mouse navigation
  this.container = document.getElementById( 'container' );

  this.camera;
  this.scene;
  this.renderer;
  this.raycaster;

  this.defaultElementColor;

  this.actualCloud;
  this.actualMesh;
  //variable to store the selected item id and color
  this.newOveredParticle = false;
  this.lastIndexMouse = -1;
  this.getLastIndMouse = function() { return this.lastIndexMouse};
  this.lastIndexMouseCol = new THREE.Color();

  this.externalSizeRange = 200;

  this.mouse = new THREE.Vector2();
  this.setMouseX = function(mx){this.mouse.x= mx};
  this.setMouseY = function(my){this.mouse.y= my};
  this.getMouseX = function() {return this.mouse.x};
  this.getMouseY = function() {return this.mouse.y};
  this.getMouse = function() {return this.mouse};
  //create a camera, and set the position according the last camera visualization positions if existed
  this.camera = new THREE.PerspectiveCamera( 16, window.innerWidth / window.innerHeight, .1, 15000);
  //this.camera = new THREE.CombinedCamera( window.innerWidth / 2, window.innerHeight / 2, 70, 1, 1000, - 500, 1000 );
  if(updating) {
    console.log("loading camera position");
    this.camera.position.x = controlsParam[0].x ;
    this.camera.position.y = controlsParam[0].y ;
    this.camera.position.z = controlsParam[0].z;
  } else {
      this.camera.position.z = this.externalSizeRange*1.8; //externalSizeRange*2.8;
  }
  if(typeof this.actualMesh !== 'undefined') {
    console.log('removing old mesh');
    this.scene.remove( this.actualMesh);
  }
  //create the scene to render
  this.scene = new THREE.Scene();
  var near = 100;// camera.position.z - externalSizeRange * .8 ;
  var far = near + this.externalSizeRange *4 ;//* .4;
  //  scene.fog = new THREE.Fog( 0x000000, near,far);

  //External cube used to draw the vertices as white lines
  var geometry = new THREE.BoxGeometry( this.externalSizeRange,this.externalSizeRange,this.externalSizeRange );
  var material = new THREE.MeshBasicMaterial( { color: 0xffffff , opacity: 0.0, transparent: true, visible:false, fog:false} );
  var cube = new THREE.Mesh( geometry, material );
  var edges = new THREE.EdgesHelper(cube, 0xffffff );
  edges.material.linewidth = 0.5;
  edges.material.fog = false;
  this.scene.add(cube);
  this.scene.add(edges);

	// raycaster to detect user interactions with mouse position
  // rayCaster to get the mouseOver info. get faces intersections to the line between the camera center and mouse position
	this.raycaster = new THREE.Raycaster();
  var threshold = 1;
  this.raycaster.params.Points.threshold = threshold;

  //Create the scatter points!
  if(typeof listX !== 'undefined') { // With the given lists
    if (geometryType == 0) {
      this.actualCloud  = new PyramidMesh(this.externalSizeRange, this.particleCount, this.particleSize, listX, listY, listZ);
    }
    else if (geometryType == 1) {
      this.actualCloud = new PointCloud( this.externalSizeRange, this.particleCount, this.particleSize, selectionMode, listX, listY, listZ);
    }
  } else {
    if (geometryType == 0) {
      this.actualCloud = new PyramidMesh(this.externalSizeRange, this.particleCount, this.particleSize );
    }
    else if (geometryType == 1) {
      this.actualCloud = new PointCloud( this.externalSizeRange, this.particleCount, this.particleSize, selectionMode ); //TODO change to the receibed data
    }
  }
  this.actualCloud.setOverSpriteAndSelectionTexture( this.scene );
  this.actualMesh = this.actualCloud.getMesh();
  //  this.actualMesh.scale.set( 10,10,10 );
  this.scene.add(this.actualMesh);


	this.renderer = new THREE.WebGLRenderer( { antialias: false} );
	this.renderer.setPixelRatio( window.devicePixelRatio );
	this.renderer.setSize( window.innerWidth, window.innerHeight );

  //when receive new data a new canvas is created, so delete the actual canvas element if exist
  if ($('canvas').length > 0) {
    $('canvas').remove();
  }

  // adding the new canvas element where to render the scene later
  this.container.appendChild( this.renderer.domElement );

  //CONTROLS | set the controls center parameters from the last visualization if exist.exist
  if(!updating) {
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement);
  } else {
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement);
    this.controls.center.x = controlsParam[1].x ;
    this.controls.center.y = controlsParam[1].y ;
    this.controls.center.z = controlsParam[1].z ;
    }

  // Setting the axis texts
  this.settingAxisTexts();

	//
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}
Scatter3d.prototype.updateAngs = function(a,b) {
  var cameraDist = this.externalSizeRange * 6;
  //first alfa angle
  var px = Math.sin(a);
  var pz = Math.cos(a);
  var vA = new THREE.Vector3(px,0,pz);
//  this.camera.position.set(px, 0, pz);
  //second beta angle
  var py = Math.sin(b);
  var pz = Math.cos(b);
  var vB = new THREE.Vector3(0,py,pz);

  var vR = new THREE.Vector3();
  vR.addVectors(vA,vB);
  vR.setLength(cameraDist);
  this.camera.position.set(vR.x, vR.y, vR.z);
}
/*
  0   >= Phi   <= PI
  -PI >= Theta <= PI
*/
Scatter3d.prototype.setPhiTheta= function(p,t) {
  this.controls.setPhi(p);
  this.controls.setTheta(t);
}
Scatter3d.prototype.updateAngB = function(a) {
  var cameraDist = this.externalSizeRange * 6;
  this.camera.position.set(0, cameraDist*Math.sin(a), cameraDist*Math.cos(a))
}
Scatter3d.prototype.updateSize = function(pSize) {
  this.actualCloud.pointCloud.material.size = this.particleSize = this.actualCloud.particleSize = pSize;
}
Scatter3d.prototype.updateColors = function() {
  this.actualCloud.updateColors();
}
Scatter3d.prototype.setNewPositionsAndColors = function (listX, listY, listZ) {
  this.actualCloud.newPositionsAndColors(listX, listY, listZ);
}
Scatter3d.prototype.animate = function () {

  // if the camera is in transition, update the up vector, defined in updatCameraPos
  if (this.cameraTransition) {
    this.camera.up.lerp(this.cameraUp, .1)
    this.updateCameraPos();
  } else {
    //this will set up camera back to (0,1,0)
    this.camera.up.lerp(this.cameraUp, .05)
  }
 	this.controls.update();
  this.actualCloud.updatePositions();
  // evaluate the raycasterIntersect only if doesn't exist any interaction with camera
  if ( this.controls.getState() == -1) {
    this.actualCloud.raycasterIntersect( this );
  }

	this.renderer.render( this.scene, this.camera );

  this.updateAxisText();
//  console.log(  particleSystem.camera.position);

  //	this.stats.update();
  controlsParam[0] = this.controls.getPos();
  controlsParam[1] = this.controls.getCenter();
}
Scatter3d.prototype.cameraTo = function( view ) {
  this.cameraTransition = view;
  console.log('move camera to: ' + view );
  this.cameraTransPos = particleSystem.camera.position.clone();
  this.cameraTransPos.y = 0;
}
Scatter3d.prototype.updateCameraPos = function () {
  var cameraDist = this.externalSizeRange * 6;
  switch (this.cameraTransition) {
    case 'xy':
      this.cameraUp.set(0,1,0);
      //this.camera.up.set(0,1,0);
      var posTo = new THREE.Vector3(0,0,cameraDist);
      break;
    case 'xz':
      //this.cameraUp.set(0,0,-1);
      //this.camera.up.set(0,0,-1);
      this.cameraUp.set(0,0,-1);
      var posTo = new THREE.Vector3(0,cameraDist,0);
      break;
    case 'yz':
      this.cameraUp.set(0,1,0);
      //this.camera.up.set(0,1,0);
      var posTo = new THREE.Vector3(cameraDist,0,0);
      break;
    default:
  }
  //console.log(this.camera.up.lerp(this.cameraUp, .1) );
  this.camera.position.lerp(posTo, .1);
  var d = this.camera.position.distanceTo(posTo);
  //console.log(d);
  if ( d < .05 ) {
     if(this.cameraTransition == 'xz'){
      this.camera.position = posTo.clone();
    //  this.camera.position.applyAxisAngle(new THREE.Vector3(0,0,1),-(Math.PI/2) )
    } else {
      this.camera.position = posTo.clone();
    }
    console.log("Camera on Place");
    this.cameraTransition = '';
    //   var refA = new THREE.Vector3(0,0,-1);
    //   var a = refA.angleTo(this.cameraTransPos);
    //   this.camera.position.applyAxisAngle(new THREE.Vector3(0,1,0),-(a%Math.PI) )
    //   this.cameraTransition = '';
    //   console.log("Camera on Place");
    // }else {
    //}
  }
}
function getScreenVector(x, y, z, camera, width, height) {
  var p = new THREE.Vector3(x, y, z);
  var vector = p.project(camera);

  vector.x = (vector.x + 1) / 2 * width;
  vector.y = -(vector.y - 1) / 2 * height;

  return vector;
}

function setStats() {
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
  if ($('#stats').length > 0) {
    $('#stats').remove();
  }
  this.container.appendChild( this.stats.domElement );
}

// AXIS TEXTS methods
Scatter3d.prototype.settingAxisTexts = function (){
	this.XaxisTextSprites = [] ;
  this.YaxisTextSprites = [] ;
  this.ZaxisTextSprites = [] ;
  axisLabels = this.axisLabels;
	scene = this.scene;
 	XaxisTextSprites = this.XaxisTextSprites;
	YaxisTextSprites = this.YaxisTextSprites;
	ZaxisTextSprites = this.ZaxisTextSprites;

  var offsetDist = this.externalSizeRange*.6;
  // X texts
  XaxisTextSprites[0] = makeTextSprite( axisLabels[0],
		{ fontsize: 18, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:200, b:200, a:0.8} } );
  XaxisTextSprites[0].position.set(0,offsetDist,offsetDist); //-externalSizeRange*.5,externalSizeRange*.5);
  XaxisTextSprites[0].name = 'Xaxis0';
  removeFromSceneObjByName('Xaxis0', scene);
  scene.add( XaxisTextSprites[0] );

  XaxisTextSprites[1] = makeTextSprite( axisLabels[0],
		{ fontsize: 18, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:200, b:200, a:0.8} } );
  XaxisTextSprites[1].position.set(0,-offsetDist,-offsetDist); //-externalSizeRange*.5,externalSizeRange*.5);
  XaxisTextSprites[1].name = 'Xaxis1';
  removeFromSceneObjByName('Xaxis1', scene);
	scene.add( XaxisTextSprites[1] );

  XaxisTextSprites[2] = makeTextSprite( axisLabels[0],
		{ fontsize: 18, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:200, b:200, a:0.8} } );
  XaxisTextSprites[2] .position.set(0,-offsetDist,offsetDist); //-externalSizeRange*.5,externalSizeRange*.5);
  XaxisTextSprites[2].name = 'Xaxis2';
  removeFromSceneObjByName('Xaxis2', scene);
	scene.add( XaxisTextSprites[2] );

  XaxisTextSprites[3] = makeTextSprite( axisLabels[0],
		{ fontsize: 18, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:200, b:200, a:0.8} } );
  XaxisTextSprites[3].position.set(0,offsetDist,-offsetDist); //-externalSizeRange*.5,externalSizeRange*.5);
  XaxisTextSprites[3].name = 'Xaxis3';
  removeFromSceneObjByName('Xaxis3', scene);
	scene.add( XaxisTextSprites[3] );

  // Y texts
  YaxisTextSprites[0] = makeTextSprite( axisLabels[1],
		{ fontsize: 18, borderColor: {r:0, g:255, b:0, a:1.0}, backgroundColor: {r:200, g:255, b:200, a:0.8} } );
	YaxisTextSprites[0].position.set(offsetDist, 0, offsetDist);
  YaxisTextSprites[0].name = 'Yaxis0';
  removeFromSceneObjByName('Yaxis0', scene);
	scene.add( YaxisTextSprites[0] );

  YaxisTextSprites[1] = makeTextSprite( axisLabels[1],
		{ fontsize: 18, borderColor: {r:0, g:255, b:0, a:1.0}, backgroundColor: {r:200, g:255, b:200, a:0.8} } );
  YaxisTextSprites[1].position.set(-offsetDist, 0, -offsetDist);
  YaxisTextSprites[1].name = 'Yaxis1';
  removeFromSceneObjByName('Yaxis1', scene);
	scene.add( YaxisTextSprites[1] );

  YaxisTextSprites[2] = makeTextSprite( axisLabels[1],
		{ fontsize: 18, borderColor: {r:0, g:255, b:0, a:1.0}, backgroundColor: {r:200, g:255, b:200, a:0.8} } );
	YaxisTextSprites[2].position.set(offsetDist, 0, -offsetDist);
  YaxisTextSprites[2].name = 'Yaxis2';
  removeFromSceneObjByName('Yaxis2', scene);
	scene.add( YaxisTextSprites[2] );

  YaxisTextSprites[3] = makeTextSprite( axisLabels[1],
		{ fontsize: 18, borderColor: {r:0, g:255, b:0, a:1.0}, backgroundColor: {r:200, g:255, b:200, a:0.8} } );
	YaxisTextSprites[3].position.set(-offsetDist, 0, offsetDist);
  YaxisTextSprites[3].name = 'Yaxis3';
  removeFromSceneObjByName('Yaxis3', scene);
	scene.add( YaxisTextSprites[3] );

  // Z texts
  ZaxisTextSprites[0] = makeTextSprite( axisLabels[2],
		{ fontsize: 18, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:200, g:200, b:255, a:0.8} } );
	ZaxisTextSprites[0].position.set(offsetDist,offsetDist,0);
  ZaxisTextSprites[0].name = 'Zaxis0';
  removeFromSceneObjByName('Zaxis0', scene);
	scene.add( ZaxisTextSprites[0] );

  ZaxisTextSprites[1] = makeTextSprite( axisLabels[2],
		{ fontsize: 18, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:200, g:200, b:255, a:0.8} } );
	ZaxisTextSprites[1].position.set(-offsetDist,-offsetDist,0);
  ZaxisTextSprites[1].name = 'Zaxis1';
  removeFromSceneObjByName('Zaxis1', scene);
	scene.add( ZaxisTextSprites[1] );

  ZaxisTextSprites[2] = makeTextSprite( axisLabels[2],
		{ fontsize: 18, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:200, g:200, b:255, a:0.8} } );
	ZaxisTextSprites[2].position.set(offsetDist,-offsetDist,0);
  ZaxisTextSprites[2].name = 'Zaxis2';
  removeFromSceneObjByName('Zaxis2', scene);
	scene.add( ZaxisTextSprites[2] );

  ZaxisTextSprites[3] = makeTextSprite( axisLabels[2],
		{ fontsize: 18, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:200, g:200, b:255, a:0.8} } );
	ZaxisTextSprites[3].position.set(-offsetDist,offsetDist,0);
  ZaxisTextSprites[3].name = 'Zaxis3';
  removeFromSceneObjByName('Zaxis3', scene);
	scene.add( ZaxisTextSprites[3] );
}
function removeFromSceneObjByName( name, scn) {
  var object = scn.getObjectByName( name  );
  if (object) {
    // If object exist remove to create a new sprite
    scn.remove(object);
  }
}
// Update the texts to set visible just the text stand out of the cube.
Scatter3d.prototype.updateAxisText = function(){
  this.setVisiblesTexts( this.XaxisTextSprites );
  this.setVisiblesTexts( this.YaxisTextSprites );
  this.setVisiblesTexts( this.ZaxisTextSprites );
}

Scatter3d.prototype.setVisiblesTexts = function( arrayPos ) {
  var maxDist=[]; // array to store the biggest distance between the texts and the index of those texts
  var vec2d = []; // to store the 2d position of the 3d text positions
  vec2d[0] = findHUDPosition(this.camera, arrayPos[0]);
  vec2d[1] = findHUDPosition(this.camera, arrayPos[1]);
  vec2d[2] = findHUDPosition(this.camera, arrayPos[2]);
  vec2d[3] = findHUDPosition(this.camera, arrayPos[3]);
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
