var expColorR;// = new Function('x,y,z,n', 'return  ( x / n ) + 0.5;');
var expColorG;// = new Function('x,y,z,n', 'return  ( y / n ) + 0.5;');
var expColorB;// = new Function('x,y,z,n', 'return  ( z / n ) + 0.5;');

function onMessageReceived( event ){
    console.log( "onMessageReceived, event.data:", event.data );

    if (typeof event !== 'undefined') {
      //the particle sizes
      var nodeSize = event.data[0][1]; // 4 - 10 are good sizes to large elements

      //the particle colors
      var expCx = event.data[0][2][0];
      var expCy = event.data[0][2][1];
      var expCz = event.data[0][2][2];
      expColorR = new Function('x,y,z,n', 'return '+ expCx );
      expColorG = new Function('x,y,z,n', 'return '+ expCy );
      expColorB = new Function('x,y,z,n', 'return '+ expCz );

     //fetch the particle positions
      var listX = typeof event.data[0][3] !== 'undefined'?event.data[0][3]:[]; // new mo.NumberList();
      var listY = typeof event.data[0][4] !== 'undefined'?event.data[0][4]:[]; //new mo.NumberList();
      var listZ = typeof event.data[0][5] !== 'undefined'?event.data[0][5]:[]; //new mo.NumberList();
      console.log("lists: ",listX, listY, listZ);

      //type of geometryElement
      var geometryType = typeof event.data[0][6] !== 'undefined'?event.data[0][6]:0; // new mo.NumberList();
      console.log("geometry type: ", geometryType );

/*      if(Object.prototype.toString.call( event.data[0][5] ) === '[object Array]') {
        console.log( "color array" );
        var colorArr = event.data[0][5]; //get the color list
        if (color.length != listX.length) {
          console.log("color list hasn't the same length than listX");
          color = color.length > 0? new THREE.Color(colorArr[0][0],colorArr[0][1],colorArr[0][2]):new THREE.Color(1,1,1);
        } else {
          color = colorArr; //pass the array 
      } else {
        console.log("No color detected. set the default");
        color = [1,1,1];
      }
      console.log( color );
*/
   //   var colors = typeof event.data[0][5] !== 'undefined'?event.data[0][5]:[]; //new mo.NumberList();
      
      //if the lists have the same lenght and have more than 1 element. use the list to get the particles number
      if ( listX.length == listY.length && listY.length == listZ.length && listX.length > 0){
        var particleNumber = listX.length;
        initScatter( particleNumber, nodeSize, geometryType , listX, listY, listZ );
      }
      else {
        var particleNumber = parseInt(event.data[0]);
        initScatter( particleNumber, nodeSize, geometryType ); 
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

 // sendMessageToParent = function( id ){ { data:[ id ] } };
