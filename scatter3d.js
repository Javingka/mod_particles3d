
var controls; // mouse navigation
var container;// DOM canvas to draw
var stats; // fps stats
var camera, scene, renderer;
var raycaster;
//var mesh, line, pyMesh ;
var defaultElementColor;

var pyramidCloud;
var pointCloud; // bufferGeometry and mesh
var actualCloud, actualMesh;

var controlsParam = [];

//variable to store the selected item id and color
var newOveredParticle = false;
var lastIndexMouse = -1;
var lastIndexMouseCol = new THREE.Color();

var	mouse = new THREE.Vector2();
var externalSizeRange;

/**
 * Set a new scatter 3d
 * @param {elementCount} how many elements will be rendered
 * @param {elementSize} size of the element
 * @param {color} Color or array of colors.
 * @param {listX} list of x coordinates
 * @param {listY} list of y coordinates
 * @param {listZ} list of z coordinates
 */
function initScatter( elementCount, geometryType, listX, listY, listZ  ) {
  container = document.getElementById( 'container' );
 // elementSize= geometryType==0? elementSize:elementSize*0.1;

  externalSizeRange = geometryType==0? 200:200;

  //create a camera, and set the position according the last camera visualization positions if existed
  camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, .1, 15000);
  if(typeof controls !== 'undefined') {
    console.log("loading camera position");
    camera.position.x = controlsParam[0].x ;
    camera.position.y = controlsParam[0].y ;
    camera.position.z = controlsParam[0].z;

  } else {
      camera.position.z = externalSizeRange*1.8; //externalSizeRange*2.8;
  }
  if(typeof actualMesh !== 'undefined') {
    console.log('removing old mesh');
    scene.remove( actualMesh);
  }
  //create the scene to render
  scene = new THREE.Scene();
  var near = 100;// camera.position.z - externalSizeRange * .8 ;
  var far = near + externalSizeRange *4 ;//* .4;
//  scene.fog = new THREE.Fog( 0x000000, near,far);

  //External cube used to draw the vertices as white lines
  var geometry = new THREE.BoxGeometry( externalSizeRange,externalSizeRange,externalSizeRange );
  var material = new THREE.MeshBasicMaterial( { color: 0xffffff , opacity: 0.0, transparent: true, visible:false, fog:false} );
  var cube = new THREE.Mesh( geometry, material );
  var edges = new THREE.EdgesHelper(cube, 0xffffff );
  edges.material.linewidth = 0.5;
  edges.material.fog = false;
  scene.add(cube);
  scene.add(edges);

	// raycaster to detect user interactions with mouse position
  // rayCaster to get the mouseOver info. get faces intersections to the line between the camera center and mouse position
	raycaster = new THREE.Raycaster();
  var threshold = 2;
  raycaster.params.Points.threshold = threshold;

  //Create the scatter points!
  if(typeof listX !== 'undefined') {
    if (geometryType == 0) {
      actualCloud  = new PyramidMesh(externalSizeRange, elementCount, listX, listY, listZ);
    }
    else if (geometryType == 1) {
      actualCloud = new PointCloud( externalSizeRange, elementCount, listX, listY, listZ);
    }
  } else {
    if (geometryType == 0) {
      actualCloud = new PyramidMesh(externalSizeRange, elementCount );
    }
    else if (geometryType == 1) {
      actualCloud = new PointCloud( externalSizeRange, elementCount );
    }
  }
  actualCloud.raycasterSetup();
  actualMesh = actualCloud.getMesh();
  //  actualMesh.scale.set( 10,10,10 );
  scene.add(actualMesh);


	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

  //when receive new data a new canvas is created, so delete the actual canvas element if exist
  if ($('canvas').length > 0) {
    $('canvas').remove();
  }

  //adding the new canvas
  container.appendChild( renderer.domElement );

  //CONTROLS | set the controls center parameters from the last visualization if exist.exist
  if(typeof controls === 'undefined') {
    controls = new THREE.OrbitControls( camera, renderer.domElement);
  } else {
    controls = new THREE.OrbitControls( camera, renderer.domElement);
    controls.center.x = controlsParam[1].x ;
    controls.center.y = controlsParam[1].y ;
    controls.center.z = controlsParam[1].z ;
  }

  settingAxisTexts();
	//
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function animateScatter() {
	requestAnimationFrame( animateScatter );

 	controls.update()
  // evaluate the raycasterIntersect only if doesn't exist any interaction with camera
  if ( controls.getState() == -1) actualCloud.raycasterIntersect(actualMesh, actualCloud.getFacesNumber());
  if ( controls.getState() == -1) {
    //getScreenVector
  }
	renderer.render( scene, camera );

  //  updateParticles();
  updateAxisText();

  //	stats.update();
  controlsParam[0] = controls.getPos();
  controlsParam[1] = controls.getCenter();
}

/*
function updateParticles() {
  var error=0.2;
  var positions = pointCldMesh.geometry.attributes.position.array;
  for(var v=0; v<PointCld.getCount(); v++){
    var easing=0.2+(v%1000)/1000;
    if(Math.abs(positions[ v * 3 + 0 ]-destination[ v * 3 + 0 ])>error)positions[ v * 3 + 0 ] += (destination[ v * 3 + 0 ]-positions[ v * 3 + 0 ])*.01;
    else{
      positions[ v * 3 + 0 ]=destination[ v * 3 + 0 ];
    }
    if(Math.abs(positions[ v * 3 + 1 ]-destination[ v * 3 + 1 ])>error)positions[ v * 3 + 1 ] += (destination[ v * 3 + 1 ]-positions[ v * 3 + 1 ])*.01;
    else{
      positions[ v * 3 + 1 ]=destination[ v * 3 + 1 ];
    }
    if(Math.abs(positions[ v * 3 + 2 ]-destination[ v * 3 + 2 ])>error)positions[ v * 3 + 2 ] += (destination[ v * 3 + 2 ]-positions[ v * 3 + 2 ])*.01;
    else{
     positions[ v * 3 + 2 ]=destination[ v * 3 + 2 ];
    }
  //              positions[ v * 3 + 0 ]=destination[ v * 3 + 0 ];
  //              positions[ v * 3 + 1 ]=destination[ v * 3 + 1 ];
  //              positions[ v * 3 + 2 ]=destination[ v * 3 + 2 ];
  }
  pointCldMesh.geometry.attributes.position.needsUpdate = true;
}*/
function getScreenVector(x, y, z, camera, width, height) {
  var p = new THREE.Vector3(x, y, z);
  var vector = p.project(camera);

  vector.x = (vector.x + 1) / 2 * width;
  vector.y = -(vector.y - 1) / 2 * height;

  return vector;
}

function setStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
  if ($('#stats').length > 0) {
    $('#stats').remove();
  }
  container.appendChild( stats.domElement );
}
