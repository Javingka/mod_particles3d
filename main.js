function onMessageReceived( event ){
    console.log( "onMessageReceived, event.data:", event.data );

    if (event.data[0].length > 0) {
      var listX = event.data[0][2]; // new mo.NumberList();
      var listY = event.data[0][3]; //new mo.NumberList();
      var listZ = event.data[0][4]; //new mo.NumberList();
      console.log("lists size: ",listX.length, listY.length, listZ.length);

      var nodeSize = event.data[0][1]; // 4 - 10 are good sizes to large elements
      //if the lists have the same lenght and have more than 1 element. use the list to get the particles number
      if ( listX.length == listY.length && listY.length == listZ.length && listX.length > 0){
        var particleNumber = listX.length;
        initScatter( particleNumber, nodeSize, listX, listY, listZ  );
      }
      else {
        var particleNumber = parseInt(event.data[0]);
        initScatter( particleNumber, nodeSize); 
      }
      animateScatter();
    }
}  

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

window.addEventListener( "message", onMessageReceived, false);



