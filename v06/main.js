var particleSystem;

// Variables controlling the incoming color list or expression
var expColorR;// = new Function('x,y,z,n', 'return  ( x / n ) + 0.5;');
var expColorG;// = new Function('x,y,z,n', 'return  ( y / n ) + 0.5;');
var expColorB;// = new Function('x,y,z,n', 'return  ( z / n ) + 0.5;');
var colorSettingType; // 0: with expressions | 1: as array | 2: one default color for all
var colorArray; // to store three arrays with
var colorDefault;

// Size particles params
var sizeSettingType; // 0: only one size | 1: as array
var sizeArray;

// Click control params
var onClickPos = new THREE.Vector2();
var onClick = false;
var onBackgroundClick = false;
// array storing the last camera and controls positions.
var controlsParam = [];
// View angles params
var prevAnglesArray = [0,0];
var anglesArrayDefault = [Math.PI*.5,0];

var prevAnglTest;
var psPrevArguments = {
      pLength: null,
      pSize: null,
      Colors: null,
      pXpos: null,
      pYpos: null,
      pZpos: null,
      pSelMode: null,
      cameraAngles: null
}
var lastXp;
function onMessageReceived( event ) {

    console.log( "onMessageReceived, event.data:", event.data );
    var logReport = '';
    if(event.data[1]==null) logReport = logReport + 'size is null '; //size
    if(event.data[2]==null) logReport = logReport + '| colorArray is null ';
    if(event.data[3]==null) logReport = logReport + '| Xpos is null '; //X pos
    if(event.data[4]==null) logReport = logReport + '| Ypos is null ';//Y pos
    if(event.data[5]==null) logReport = logReport + '| Zpos is null '; //Z pos

    if (logReport != '') {
      console.log("no conditions to draw: " , logReport);
      prevAnglesArray = [0,0];
      anglesArrayDefault = [Math.PI*.5,0];
      return;
    }

    // Positions array should have the same length
    var workingPositionLists = false; // To know if the receibed list are fine.
    if (event.data[3].length == event.data[4].length && event.data[4].length == event.data[5].length) {
       workingPositionLists = true;
    } else {
      console.log("Positions arrays has different lengths");
      return;
    }

    // Color
    var Cx = event.data[2][0];
    var myRe = /(\d,\d,\d)/;
    var regEx = myRe.exec(Cx);
    if ( event.data[2].length == 3) { // size of three could be the expression for the colors
      var Cx = event.data[2][0];
      var Cy = event.data[2][1];
      var Cz = event.data[2][2];
      if (regEx == null && typeof Cx === 'string' && typeof Cy === 'string' && typeof Cz === 'string' ) {
          console.log('expression to define colors');
          colorSettingType = 0; //the color is set by expressions to be evaluated
      }
    } else if ( regEx != null ) { // if not could be an array with string colors
      if ( event.data[2].length == event.data[3].length) { //Look the length
        colorSettingType = 1; //the color is set by the array
        console.log("color array has the same length with positions");
      } else {
        console.log("color array has different length with positions arrays");
        return;
      }
    } else { //Finaly could be an array but with numbers, no with strings
      if ( event.data[2].length == event.data[3].length) { //Look the length
        console.log("color array has the same length with positions");
        if ( Array.isArray(Cx) && Cx.length == 3 ) {
          colorSettingType = 1; //the color is set by the array
          console.log( 'color array is made with number array');
        } else {
          console.log("color array does not seems to hace a color syntax (red, gree, blue)");
          return;
        }
      } else {
        console.log("color array has different length with positions arrays");
        return;
      }
    }


    if ( event.data.name != "selected-Array" &&
      event.data.name != 'rollover' &&
      event.data.name != 'selected-particle' &&
      event.data.name != 'clear-selection')
      {
      console.log("Has conditions to draw");


      //Variables to create the particle system
      var axisLabels=[];
      var sizeDefault;
      var particleNumber;

     //fetch the particle positions  or create a empty list
      var listX = typeof event.data[3] !== 'undefined'?event.data[3]:[]; //
      var listY = typeof event.data[4] !== 'undefined'?event.data[4]:[]; //
      var listZ = typeof event.data[5] !== 'undefined'?event.data[5]:[]; //
      //console.log("lists: ",listX, listY, listZ);
      console.log('lastXp == listX', (lastXp==listX)) ;
      lastXp = listX;
      //evalueate the lists lengths
      if ( listX.length == listY.length && listY.length == listZ.length && listX.length > 0) {
        particleNumber = listX.length;
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
      var selectionMode = typeof event.data[6] !== 'undefined'?event.data[6]:0; //
      console.log("selectionMode: ", selectionMode, " → ", (selectionMode==0?"single selection":"multiple selection") );

      // View Angles
      //var anglesChanged = true;
      var phiAng, thetaAng;

      //var anglesArray = event.data[7]!=null?event.data[7]:anglesArrayDefault ;
      var anglesChanged = event.data[7]!=prevAnglTest;
      console.log('anglesChanged: ',anglesChanged, ' prevAnglTest ', prevAnglTest, ' event.data[7]', event.data[7]);
      prevAnglTest = event.data[7];
      //var anglesArray = Array.isArray(event.data[7])?event.data[7]:anglesArrayDefault ;
      //  var anglesArray = event.data[7]!=null?event.data[7]:anglesArrayDefault ;
      if (anglesChanged) {
        console.log('angles with changes');
        anglesArray = event.data[7].split(',');
        //anglesChanged = false;
      } else {
        console.log('angles with no changes');
        anglesArray = prevAnglTest.split(',');
      }
      phiAng = anglesArray[0]; //Array.isArray(event.data[7])?event.data[7][0]:Math.PI*.5;
      thetaAng = anglesArray[1]; //Array.isArray(event.data[7])?event.data[7][1]:0;
      console.log('camera angles, phi: ' + phiAng + ' theta: ' + thetaAng);
      //prevAnglesArray = anglesArray;// event.data[7];

      //the particle sizes
      var incomingSize = event.data[1]; // 1 - 4 are good sizes to large elements
      // if the size is an array TODO: Make it works ( by now we manage just one size for all particles)
      if ( Array.isArray( incomingSize) && incomingSize.length == listX.length && workingPositionLists ) {
        sizeSettingType = 1;
        sizeArray = incomingSize;
        sizeDefault = incomingSize[0]; // TODO Change this. to particles be able to receibe an array with sizes
        console.log("sizeSettingType: " + sizeSettingType+'→ sizeArray ', sizeArray);
      } else {
        sizeSettingType = 0;
        sizeDefault = incomingSize;
        console.log("sizeSettingType: " + sizeSettingType+'→ sizeDefault  ', sizeDefault );
      }
      console.log();

      //the particle colors
      // If the color array has 3 elements lets check if are expressions
      if ( event.data[2].length == 3) {
        var Cx = event.data[2][0];
        var Cy = event.data[2][1];
        var Cz = event.data[2][2];
        var myRe = /(\d,\d,\d)/;
        var regEx = myRe.exec(Cx);
        if (regEx == null && typeof Cx === 'string' && typeof Cy === 'string' && typeof Cz === 'string' ) {
          console.log('setting method to define colors');
          colorSettingType = 0; //the color is set by expressions to be evaluated
          expColorR = new Function('x,y,z,n', 'return '+ Cx );
          expColorG = new Function('x,y,z,n', 'return '+ Cy );
          expColorB = new Function('x,y,z,n', 'return '+ Cz );
        }
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
          particleSystem.setPhiTheta(phiAng,thetaAng);
        } else
        { // Or update the actual system
          console.log('Update the particle System');
          //If it has the same positions length. Update just that.
          if ( particleSystem.particleCount == particleNumber) {
            particleSystem.setNewPositionsAndColors(listX, listY, listZ);
            particleSystem.updateSize(sizeDefault);
            particleSystem.actualCloud.setOverSpriteAndSelectionTexture( particleSystem.scene );
            particleSystem.axisLabels = axisLabels;
            particleSystem.settingAxisTexts();
            if (particleSystem.actualCloud.selMode == 1 ) // if previous is multi selection
              particleSystem.actualCloud.clearSelection(); // clean it
            particleSystem.actualCloud.selMode = selectionMode;
            if (anglesChanged) particleSystem.setPhiTheta(phiAng,thetaAng);
            console.log('The new list has the same length than last one');
          } else {
            console.log('the new message has a different length so make it all again');
            particleSystem = new Scatter3d( particleNumber , geometryType, sizeDefault, axisLabels, selectionMode, true, listX, listY, listZ );
            particleSystem.setPhiTheta(phiAng,thetaAng);
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
    psPrevArguments = {
      pLength: event.data[0],
      pSize: event.data[1],
      Colors: event.data[2],
      pXpos: event.data[3],
      pYpos: event.data[4],
      pZpos: event.data[5],
      pSelMode: event.data[6],
      cameraAngles: event.data[7]
    }
    console.log('psPrevArg: ', psPrevArguments);
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
// Register to the 'message' event to get the previous function called
window.addEventListener( "message", onMessageReceived, false);
// when the mouse moves, call the given function
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mouseup', onMouseUp, false );

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );
function onDocumentMouseDown( event ) {
  onClickPos.x = particleSystem.getMouseX();
  onClickPos.y = particleSystem.getMouseY();
  particleSystem.cameraUp.set(0,1,0);
}
function onMouseUp( event ) {
  //console.log(particleSystem.actualCloud.onTransition);
  var d = onClickPos.distanceTo( particleSystem.getMouse() );
  //console.log("d: " + d + " LastMouse; " +  particleSystem.getLastIndMouse() + " controlsState: " + particleSystem.controls.getState());
  if (d < 0.01 ) { // The difference is low so it is considered as a click
    if ( particleSystem.actualCloud.lastIndexMouse != -1 && particleSystem.controls.getState() !=1 )
    {
      if (!particleSystem.actualCloud.onTransition ) onClick = true; // just detect when the particles are static
    }
    if ( particleSystem.actualCloud.lastIndexMouse == -1 && particleSystem.controls.getState() !=1)
    {
     onBackgroundClick = true;
    }
  }
}

function onKeyDown( event ) {
  var cameraToView = "";
  switch (event.keyCode) {
    case 49:
    case 97:
      cameraToView = 'xy'
      break;
    case 50:
    case 98:
      cameraToView = 'xz'
      break;
    case 51:
    case 99:
      cameraToView = 'yz'
      break;
    default:
  }
  particleSystem.cameraTo(cameraToView);
}
function onKeyUp( event ) {
}
// A simple function to send messages to the parent window
function sendMessageToParent( message ){
  parent.postMessage( message, '*' );
}

function createSendMessageToParent (a,n) {
  a.name = n;
  var msg =  { message:'output', data:a };
  sendMessageToParent( msg ); // SEND!! message to Lichen
//  console.log(n, ' send to parent with the value:  ',a );
}
