   
var listX = new mo.NumberList();
var listY = new mo.NumberList();
var listZ = new mo.NumberList();

var controls;
var container, stats;
var camera, scene, renderer;
var raycaster, mouse;
var mesh, line;
initScatter( 6 , 200 ); //count and size
animateScatter();

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}



