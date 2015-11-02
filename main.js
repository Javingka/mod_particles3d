var particleSystem;

// Variables controlling the incoming color list or expression
var expColorR;// = new Function('x,y,z,n', 'return  ( x / n ) + 0.5;');
var expColorG;// = new Function('x,y,z,n', 'return  ( y / n ) + 0.5;');
var expColorB;// = new Function('x,y,z,n', 'return  ( z / n ) + 0.5;');
var colorSettingType; // 0: with expressions | 1: as array | 2: one default color for all
var colorArray; // to store three arrays with
var colorDefault;

var sizeSettingType; // 0: only one size | 1: as array
var sizeArray;

var onClickPos = new THREE.Vector2();
var onClick = false;
var onBackgroundClick = false;

var controlsParam = []; // array storing the last camera and controls positions.
function onMessageReceived( event ){

    if (typeof event !== 'undefined' &&
      event.data.name != "selected-Array" &&
      event.data.name != 'rollover' &&
      event.data.name != 'selected-particle' &&
      event.data.name != 'clear-selection')
      {
      console.log( "onMessageReceived, event.data:", event.data );

      //Variables to create the particle system
      var axisLabels=[];
      var sizeDefault;
      var workingPositionLists = false; // To know if the receibed list are fine.
      var particleNumber;

     //fetch the particle positions  or create a empty list
      var listX = typeof event.data[3] !== 'undefined'?event.data[3]:[]; //
      var listY = typeof event.data[4] !== 'undefined'?event.data[4]:[]; //
      var listZ = typeof event.data[5] !== 'undefined'?event.data[5]:[]; //
      console.log("lists: ",listX, listY, listZ);

      //evalueate the lists lengths
      if ( listX.length == listY.length && listY.length == listZ.length && listX.length > 0) {
        particleNumber = listX.length;
        workingPositionLists = true;
      } else {
        particleNumber = parseInt(event.data[0]);
      }
      //Set the axis names
      axisLabels[0] =  typeof listX.name === 'string'? listX.name : 'X';
      axisLabels[1] =  typeof listY.name === 'string'? listY.name : 'Y';
      axisLabels[2] =  typeof listZ.name === 'string'? listZ.name : 'Z';
      console.log("Axis labels: ", axisLabels);

      //type of geometryElement
      var geometryType = 1;
      console.log("geometry type: ", geometryType, " → ", (geometryType==0?"pyramids":"square") );
      // tyoe of selection element
      var selectionMode = typeof event.data[6] !== 'undefined'?event.data[6]:1; //
      console.log("selectionMode: ", selectionMode, " → ", (selectionMode==0?"single selection":"multiple selection") );

      //the particle sizes
      var incomingSize = event.data[1]; // 1 - 4 are good sizes to large elements
      // if the size is an array TODO: Make it works ( by now we manage just one size for all particles)
      if ( Array.isArray( incomingSize) && incomingSize.length == listX.length && workingPositionLists ) {
        sizeSettingType = 1;
        sizeArray = incomingSize;
        sizeDefault = incomingSize[0]; // TODO Change this. to be able particles to receibe an array with sizes
        console.log("sizeSettingType: " + sizeSettingType+'→ sizeArray ', sizeArray);
      } else {
        sizeSettingType = 0;
        sizeDefault = incomingSize;
        console.log("sizeSettingType: " + sizeSettingType+'→ sizeDefault  ', sizeDefault );
      }
      console.log();

      //the particle colors
      var Cx = event.data[2][0];
      var Cy = event.data[2][1];
      var Cz = event.data[2][2];
      var myRe = /(\d,\d,\d)/;
      var regEx = myRe.exec(Cx);
      //console.log("regEx: ", regEx, " Cx ", Cx);
      if ( event.data[2].length == 3 && regEx == null && typeof Cx === 'string' && typeof Cy === 'string' && typeof Cz === 'string' ){
        console.log('setting method to define colors');
        colorSettingType = 0; //the color is set by expressions to be evaluated
        expColorR = new Function('x,y,z,n', 'return '+ Cx );
        expColorG = new Function('x,y,z,n', 'return '+ Cy );
        expColorB = new Function('x,y,z,n', 'return '+ Cz );
      } else if ( event.data[2].length == particleNumber) {
        colorSettingType = 1; //the color is set by the array
        colorArray = event.data[2];
      } else {
        colorSettingType = 2; //the color is set by the array
        colorDefault = new THREE.Color(1,1,1);
      }
      console.log("color Setting: ", colorSettingType);
      // Array with the sizes of each particle
 //     var listSize = typeof event.data[6] !== 'undefined'?event.data[6]:[]; //inverted

      // send a parent message to clean possible old data
      createSendMessageToParent( [-1,-1], 'rollover');

      //if the lists have the same lenght and have more than 1 element. use the list to get the particles number
      if (workingPositionLists){
        console.log('The receibed message has a valid position list');
        // the first call to create a particle system
        if ( typeof particleSystem === 'undefined') {
          console.log('First particle System creation');
          particleSystem = new Scatter3d( particleNumber , geometryType, sizeDefault, axisLabels, selectionMode, false, listX, listY, listZ );
        } else
        { // Or update the actual system
          console.log('Update the particle System');
          //If it has the same positions length. Update just that.
          if ( particleSystem.particleCount == particleNumber) {
            particleSystem.setNewPositionsAndColors(listX, listY, listZ);
            particleSystem.updateSize(sizeDefault);
            particleSystem.actualCloud.setOverSpriteAndSelectionTexture( particleSystem.scene );
            console.log('The new list has the same length than last one');
          } else {
            console.log('the new message has a different length so make it all again');
            particleSystem = new Scatter3d( particleNumber , geometryType, sizeDefault, axisLabels, selectionMode, true, listX, listY, listZ );
          }
        }
      }
      else {
        console.log('The receibed message has a invalid position list');
        if ( typeof particleSystem === 'undefined') {
          console.log('First particle System creation');
          particleSystem = new Scatter3d( particleNumber , geometryType, sizeDefault, axisLabels, selectionMode, false);
        } else { // Or update the actual system
          console.log('Create again keeping the camera position');
          particleSystem = new Scatter3d( particleNumber , geometryType, sizeDefault, axisLabels, selectionMode, true);
        }
      }
      animate( );
      //particleSystem.animateScatter();
    }
}
function animate() {
	requestAnimationFrame( animate );
  particleSystem.animate();
}

function onWindowResize() {
	particleSystem.camera.aspect = window.innerWidth / window.innerHeight;
	particleSystem.camera.updateProjectionMatrix();
	particleSystem.renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	particleSystem.setMouseX( ( event.clientX / window.innerWidth ) * 2 - 1 );
	particleSystem.setMouseY(- ( event.clientY / window.innerHeight ) * 2 + 1 );
}
// when the mouse moves, call the given function
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mouseup', onMouseUp, false );
function onDocumentMouseDown( event ) {
  onClickPos.x = particleSystem.getMouseX();
  onClickPos.y = particleSystem.getMouseY();
}
function onMouseUp( event ) {
  //console.log(particleSystem.actualCloud.onTransition);
  var d = onClickPos.distanceTo( particleSystem.getMouse() );
  //console.log("d: " + d + " LastMouse; " +  particleSystem.getLastIndMouse() + " controlsState: " + particleSystem.controls.getState());
  if (d < 0.01 ) { // The difference is low so it is considered as a click
    if ( particleSystem.actualCloud.lastIndexMouse != -1 && particleSystem.controls.getState() !=1 )
    {
      if (particleSystem.actualCloud.onTransition ) alert("Wait until the particles stop to select them");
      else onClick = true;
    }
    if ( particleSystem.actualCloud.lastIndexMouse == -1 && particleSystem.controls.getState() !=1)
    {
     onBackgroundClick = true;
    }
  }
}

// Register to the 'message' event to get the previous function called
window.addEventListener( "message", onMessageReceived, false);

// A simple function to send messages to the parent window
function sendMessageToParent( message ){
  parent.postMessage( message, '*' );
}

function createSendMessageToParent (a,n) {
  a.name = n;
  sendMessageToParent( a ); // SEND!! message to Lichen
//  console.log(n, ' send to parent with the value:  ',a );
}
