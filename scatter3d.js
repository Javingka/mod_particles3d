/**
 * Set a new scatter 3d 
 * @param {elementCount} how many elements will be rendered  
 * @param {elementSize} size of the element  
 */
function initScatter( elementCount, elementSize, listX, listY, listZ  ) {
  container = document.getElementById( 'container' );
  //
  camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, .1, 15000 );
  if(typeof controls !== 'undefined') {
    console.log("loading camera position");
    console.log(controlsParam);
    camera.position.x = controlsParam[0].x ; 
    camera.position.y = controlsParam[0].y ; 
    camera.position.z = controlsParam[0].z ; 

  } else {
    camera.position.z = 4000;
  }

  scene = new THREE.Scene();

  //External cube used to draw the vertices as white lines
  var geometry = new THREE.BoxGeometry( 2000,2000,2000 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffffff , opacity: 0.0, transparent: true, visible:false} );
  var cube = new THREE.Mesh( geometry, material );
  var edges = new THREE.EdgesHelper(cube, 0xffffff );
  edges.material.linewidth = 0.5;
  scene.add(cube);
  scene.add(edges);
  
  //Create the shape
  if(typeof listX !== 'undefined') {
    bipyramidShape( elementCount, elementSize, 6, listX, listY, listZ);
    //triangleShape( elementCount, elementSize, listX, listY, listZ );
  } else {
    bipyramidShape( elementCount, elementSize, 6);
    //triangleShape( elementCount, elementSize );
  }

  // rayCaster to get the mouseOver info
	raycaster = new THREE.Raycaster();

	mouse = new THREE.Vector2();

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( 4 * 3 ), 3 ) );

	var material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1, transparent: true } );

  line = new THREE.Line( geometry, material );
	scene.add( line );

	//

	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

  if ($('canvas').length > 0) {
    $('canvas').remove();
  }

  container.appendChild( renderer.domElement );

  //CONTROLS
  if(typeof controls === 'undefined') {
    controls = new THREE.OrbitControls( camera, renderer.domElement);
  } else {
    controls = new THREE.OrbitControls( camera, renderer.domElement);
    controls.center.x = controlsParam[1].x ; 
    controls.center.y = controlsParam[1].y ; 
    controls.center.z = controlsParam[1].z ; 
  }
	//

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


function renderScatter() {
	var time = Date.now() * 0.001;

//	mesh.rotation.x = time * 0.15;
//	mesh.rotation.y = time * 0.25;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObject( mesh );

	if ( intersects.length > 0 ) {
		var intersect = intersects[ 0 ];
		var face = intersect.face;
    var obj = intersect.object;

		var linePosition = line.geometry.attributes.position;
		var meshPosition = mesh.geometry.attributes.position;
    
    console.log ("id: " +  Math.floor( (intersect.index/3) / 1) );
    
//.copyAt ( index1, attribute, index2 )
//Copies itemSize values in the array from the vertex at index2 to the vertex at index1.
		linePosition.copyAt( 0, meshPosition, face.a );
		linePosition.copyAt( 1, meshPosition, face.b );
		linePosition.copyAt( 2, meshPosition, face.c );
		linePosition.copyAt( 3, meshPosition, face.a );

		mesh.updateMatrix();

		line.geometry.applyMatrix( mesh.matrix );

		line.visible = true;

	} else {

		line.visible = false;

	}

	renderer.render( scene, camera );

}


function animateScatter() {

	requestAnimationFrame( animateScatter );

	renderScatter();
	stats.update();
	controls.update();
  controlsParam[0] = controls.getPos(); 
  controlsParam[1] = controls.getCenter(); 
}


