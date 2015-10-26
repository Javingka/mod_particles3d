
var controls; // mouse navigation
var container;// DOM canvas to draw 
var stats; // fps stats
var camera, scene, renderer;
var raycaster, mouse;
var mesh, line;
var defaultElementColor;

var controlsParam = [];
var faceNumb; //variable to set the number of each element's faces 

//variable to store the selected item id and color
var newFaceSelected = false;
var lastIndexMouse = -1;
var lastIndexMouseCol = new THREE.Color();

/**
 * Set a new scatter 3d 
 * @param {elementCount} how many elements will be rendered  
 * @param {elementSize} size of the element  
 * @param {color} Color or array of colors. 
 * @param {listX} list of x coordinates 
 * @param {listY} list of y coordinates
 * @param {listZ} list of z coordinates
 */
function initScatter( elementCount, elementSize, geometryType, listX, listY, listZ  ) {
  container = document.getElementById( 'container' );
  

  //create a camera, and set the position according the last camera visualization positions if existed
  camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, .1, 15000 );
  if(typeof controls !== 'undefined') {
    console.log("loading camera position");
    camera.position.x = controlsParam[0].x ; 
    camera.position.y = controlsParam[0].y ; 
    camera.position.z = controlsParam[0].z ; 

  } else {
    camera.position.z = 4000;
  }
  if(typeof mesh !== 'undefined') {
    console.log('removing old mesh');
    scene.remove( mesh );
  }
  //create the scene to render
  scene = new THREE.Scene();

  //External cube used to draw the vertices as white lines
  var geometry = new THREE.BoxGeometry( 2000,2000,2000 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffffff , opacity: 0.0, transparent: true, visible:false} );
  var cube = new THREE.Mesh( geometry, material );
  var edges = new THREE.EdgesHelper(cube, 0xffffff );
  edges.material.linewidth = 0.5;
  scene.add(cube);
  scene.add(edges);
  
  //Create the scatter points! | IF THE ELEMENT GEOMETRY CHANGE, IT SHOULD CHANGE THE faceNumb TOO;
  faceNumb = 4;
  if(typeof listX !== 'undefined') {
    if (geometryType == 0) addTriangleShape( elementCount, elementSize, listX, listY, listZ);
    else if (geometryType == 1) addPolyhedronMesh( elementCount, elementSize, faceNumb, listX, listY, listZ);
    else if (geometryType == 2) addPyramidMesh( elementCount, elementSize, listX, listY, listZ);
    //addPolyhedronMesh( elementCount, elementSize, faceNumb, listX, listY, listZ);
    //faceNumb = 1; addTriangleShape( elementCount, elementSize, listX, listY, listZ );
  } else {
    if (geometryType == 0) addTriangleShape( elementCount, elementSize);
    else if (geometryType == 1) addPolyhedronMesh( elementCount, elementSize, faceNumb);
    else if (geometryType == 2) addPyramidMesh( elementCount, elementSize); 
    //addPolyhedronMesh( elementCount, elementSize, faceNumb);
    //faceNumb = 1; addTriangleShape( elementCount, elementSize );
  }

	// raycaster to detect user interactions with mouse position
  raycasterInit();

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

  //set the starts parameters and eliminte the last one if existed.
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
  if ($('#stats').length > 0) {
    $('#stats').remove();
  }
  container.appendChild( stats.domElement );

	//
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function animateScatter() {
	requestAnimationFrame( animateScatter );

  raycasterIntersect();
	renderer.render( scene, camera );

	stats.update();
	controls.update();
  controlsParam[0] = controls.getPos(); 
  controlsParam[1] = controls.getCenter(); 
}


