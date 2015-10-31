// Variables controlling the incoming color list or expression
var expColorR;// = new Function('x,y,z,n', 'return  ( x / n ) + 0.5;');
var expColorG;// = new Function('x,y,z,n', 'return  ( y / n ) + 0.5;');
var expColorB;// = new Function('x,y,z,n', 'return  ( z / n ) + 0.5;');
var colorSettingType; // 0: with expressions | 1: as array | 2: one default color for all
var colorArray; // to store three arrays with
var colorDefault;

var sizeSettingType; // 0: only one size | 1: as array
var sizeArray;
var sizeDefault;
var particleNumber;

var onClick = false;
var axisLabels=[];
function onMessageReceived( event ){

    if (typeof event !== 'undefined' &&
      event.data.name != "selected-Array" &&
      event.data.name != 'rollover' &&
      event.data.name != 'selected-particle')
      {
      console.log( "onMessageReceived, event.data:", event.data );
      var workingPositionLists = false;

     //fetch the particle positions
      var listX = typeof event.data[3] !== 'undefined'?event.data[3]:[]; // new mo.NumberList();
      var listY = typeof event.data[4] !== 'undefined'?event.data[4]:[]; //new mo.NumberList();
      var listZ = typeof event.data[5] !== 'undefined'?event.data[5]:[]; //inverted
      console.log("lists: ",listX, listY, listZ);

      if ( listX.length == listY.length && listY.length == listZ.length && listX.length > 0) {
        particleNumber = listX.length;
        workingPositionLists = true;
        axisLabels[0] =  typeof listX.name === 'string'? listX.name : 'X';
        axisLabels[1] =  typeof listY.name === 'string'? listY.name : 'Y';
        axisLabels[2] =  typeof listZ.name === 'string'? listZ.name : 'Z';
      } else {
        particleNumber = parseInt(event.data[0]);
        axisLabels[0] =  typeof listX.name === 'string'? listX.name : 'X';
        axisLabels[1] =  typeof listY.name === 'string'? listY.name : 'Y';
        axisLabels[2] =  typeof listZ.name === 'string'? listZ.name : 'Z';
      }
      console.log("Axis labels: ", axisLabels);

       //type of geometryElement
      var geometryType = 1;
      var selectionMode = typeof event.data[6] !== 'undefined'?event.data[6]:1; // 0 → pyramid | 1 → square
      console.log("geometry type: ", geometryType, " → ", (geometryType==0?"pyramids":"square") );

      //the particle sizes
      var incomingSize = event.data[1]; // 4 - 10 are good sizes to large elements
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
      if ( event.data[2].length == 3 && typeof Cx === 'string' && typeof Cy === 'string' && typeof Cz === 'string' ){
        colorSettingType = 0; //the color is set by expressions to be evaluated
        expColorR = new Function('x,y,z,n', 'return '+ Cx );
        expColorG = new Function('x,y,z,n', 'return '+ Cy );
        expColorB = new Function('x,y,z,n', 'return '+ Cz );
      } else if ( workingPositionLists  && event.data[2].length == listX.length) {
        colorSettingType = 1; //the color is set by the array
        colorArray = event.data[2];
      } else {
        colorSettingType = 2; //the color is set by the array
        colorDefault = new THREE.Color(1,1,1);
      }

      // Array with the sizes of each particle
 //     var listSize = typeof event.data[6] !== 'undefined'?event.data[6]:[]; //inverted

      // send a parent message to clean possible old data
      createSendMessageToParent( [-1,-1], 'rollover');
      //if the lists have the same lenght and have more than 1 element. use the list to get the particles number
      if (workingPositionLists){
        initScatter( particleNumber , geometryType, selectionMode, listX, listY, listZ );
      }
      else {
        initScatter( particleNumber , geometryType, selectionMode );
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
//  if (controls.getState() ==0 ) onClick = false;
}
// when the mouse moves, call the given function
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mouseup', onMouseUp, false );
function onDocumentMouseDown( event )
{
  if ( lastIndexMouse != -1 && controls.getState() !=1 ) onClick = true;
}
function onMouseUp( event ) {
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
  console.log(n, ' send to parent with the value:  ',a );
}
