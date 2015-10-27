function raycasterInit(){
  // rayCaster to get the mouseOver info. get faces intersections to the line between the camera center and mouse position
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

  // create a geometry to draw a white line over the face intersected
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( 4 * 3 ), 3 ) );
	var material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1, transparent: true } );
  line = new THREE.Line( geometry, material );
	scene.add( line );

  //setting the pyramid to show when any element is overed
  var colors = new Float32Array( 4 * 3 * 3);
  var positions = new Float32Array( 4 * 3 * 3);
  var normals = new Float32Array( 4 * 3 * 3);
  var color = new THREE.Color(1,0,1);
  for ( var c = 0; c<(4*3); c++) { // loop through the vertex
    colors[ (3*c) ]     = color.r;
    colors[ (3*c) + 1 ] = color.g;
    colors[ (3*c) + 2 ] = color.b;
    positions[ (3*c) ]     = 0;
    positions[ (3*c) + 1 ] = 0;
    positions[ (3*c) + 2 ] = 0;
    normals[ (3*c) ]     = 0;
    normals[ (3*c) + 1 ] = 0;
    normals[ (3*c) + 2 ] = 0;
  } 
  var geometry = new THREE.BufferGeometry();
  geometry.addAttribute( 'position', new THREE.BufferAttribute(positions, 3 )); //4 faces w/ 3 vetex w/ 3 coordinates
	geometry.addAttribute( 'normal', new THREE.BufferAttribute(normals, 3 ));
	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3) );
  var material = new THREE.MeshBasicMaterial( {
     color: 0xffffff,  vertexColors: THREE.VertexColors, transparent: false
	} );
	pyMesh = new THREE.Mesh( geometry, material );
	scene.add( pyMesh );
}

function raycasterIntersect() {
	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObject( mesh );
	if ( intersects.length > 0 ) {
		var intersect = intersects[ 0 ]; //the first face intersecting the line between the camera center and the mouse point
		var face = intersect.face;
    var obj = intersect.object;
    //get the position attribute of each geometry. an array wich x,y,z of each line's and  mesh's vertex
		var linePosition = line.geometry.attributes.position;
		var meshPosition = mesh.geometry.attributes.position;
    var meshOveredPos = pyMesh.geometry.attributes.position;
    
    // To get one ID by element. 
    // intersect.index consider the total vertex list, /3 gives one vertex_id per face.
    // and /faceNum reduce the list to the total ob element (each element has faceNumb number of faces) 
    // the result is going to be a float number. the integer part of that number is the element ID.
    var indexElementRollover =  Math.floor( intersect.index/3 / faceNumb );

    if (intersect.index != lastIndexMouse) { // new over element 
           newFaceSelected = true;
      lastIndexMouse = intersect.index;
 //     sendMessageToParent( { message:'ok', numericProperty:lastIndexMouse, arrayProperty:[ lastIndexMouse ] } );
    } 
    
   
    //set the line values to draw the white border of the intersected face
    //.copyAt ( index1, attribute, index2 )
    //Copies itemSize values in the array from the vertex at index2 to the vertex at index1.
		linePosition.copyAt( 0, meshPosition, face.a );
		linePosition.copyAt( 1, meshPosition, face.b );
		linePosition.copyAt( 2, meshPosition, face.c );
		linePosition.copyAt( 3, meshPosition, face.a );
    
    // to draw the pyramid on focus.
    var indx = indexElementRollover * faceNumb * 3; //the fist index of the selected element
    for (var i = 0; i < 4*3; i++){ //copy al positions from the focudes pyramid
      meshOveredPos.copyAt( i, meshPosition, indx+i);  
    }

    //mesh has to be warned about the changes to update the graphics.
		//mesh.updateMatrix();
    
    pyMesh.geometry.applyMatrix( mesh.matrix );
    pyMesh.visible = true; 
    //update line matrix according the mesh
		line.geometry.applyMatrix( mesh.matrix );
		line.visible = true;
	} else {
    // To detect when the mouse leave an intersected face and has no other consecutive intersect detection.
    if (newFaceSelected )  {
      newFaceSelected  = false;
      lastIndexMouse = -1;
 //     sendMessageToParent( { message:'ok', numericProperty:lastIndexMouse, arrayProperty:[ lastIndexMouse ] } );
    } 
		line.visible = false;
    pyMesh.visible = false; 
	}
}

/* From here to the bottom is deprecated, it used to much process. but is a good example of how to get and set the color from a buffer geometry element
 * */
function oldRaycasterIntersect() {
	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObject( mesh );
	if ( intersects.length > 0 ) {
		var intersect = intersects[ 0 ]; //the first face intersecting the line between the camera center and the mouse point
		var face = intersect.face;
    var obj = intersect.object;
    //get the position attribute of each geometry. an array wich x,y,z of each line's and  mesh's vertex
		var linePosition = line.geometry.attributes.position;
		var meshPosition = scene.children[2].geometry.attributes.position;

    // working on color
		var meshColor = mesh.geometry.attributes.color;
    if (intersect.index != lastIndexMouse) { // new over element 
      newFaceSelected = true;

      // if exist a consecutive previous element overed. give its color back.   
      if (lastIndexMouse != -1) setPolyMeshColor( meshColor, lastIndexMouse, lastIndexMouseCol );
      
      // fetch the actual color to be used later to return it. As above.
      lastIndexMouseCol = new THREE.Color(meshColor.array[intersect.index*3], //  3 is the 'itemSize' of the color array. i.e. 
                                         meshColor.array[intersect.index*3+1], // how many items of the array are associated 
                                         meshColor.array[intersect.index*3+2] ); // with a particular vertex

      // setting the color for the overed face
      setPolyMeshColor( meshColor, intersect.index, new THREE.Color(1,1,1));

      lastIndexMouse = intersect.index;
    } 
    
    // To get one ID by element. 
    // intersect.index consider the total vertex list, /3 gives one vertex_id per face.
    // and /faceNum reduce the list to the total ob element (each element has faceNumb number of faces) 
    // the result is going to be a float number. the integer part of that number is the element ID.
    var indexElementRollover =  Math.floor( intersect.index/3 / faceNumb );
    //set the line values to draw the white border of the intersected face
    //.copyAt ( index1, attribute, index2 )
    //Copies itemSize values in the array from the vertex at index2 to the vertex at index1.
		linePosition.copyAt( 0, meshPosition, face.a );
		linePosition.copyAt( 1, meshPosition, face.b );
		linePosition.copyAt( 2, meshPosition, face.c );
		linePosition.copyAt( 3, meshPosition, face.a );
    
    //mesh has to be warned about the changes to update the graphics.
    meshColor.needsUpdate = true;
		mesh.updateMatrix();
    //update line matrix according the mesh
		line.geometry.applyMatrix( mesh.matrix );
		line.visible = true;
	} else {
    // To detect when the mouse leave an intersected face and has no other consecutive intersect detection.
    if (newFaceSelected )  {
      newFaceSelected  = false;
		  var meshColor = mesh.geometry.attributes.color;
      setPolyMeshColor( meshColor, lastIndexMouse, lastIndexMouseCol);
      lastIndexMouse = -1;
      meshColor.needsUpdate = true;
    } 
		line.visible = false;
    pyMesh.visible = false; 
	}
}
var setPolyMeshColor = function (m, ind, col) {
  var floatp = Math.floor( ind/3 / faceNumb ); //get the id of the element intersected
  var i = floatp * faceNumb * 3; //the fist index of the selected element

  for (var f=0; f<faceNumb; f++) {
    var faceToPaint = 3*f; //go three by three indexes to point to each face's vertex.
  // setXYZ multiplies by 'itemSize' so we don't need to do it as when we access directly to the array
  m.setXYZ ( i + faceToPaint + 0, col.r, col.g, col.b);//
  m.setXYZ ( i + faceToPaint + 1, col.r, col.g, col.b);//
  m.setXYZ ( i + faceToPaint + 2, col.r, col.g, col.b);//     // 
  }
}

var setFaceMeshColor = function (m, ind, col) {
  // setXYZ multiplies by 'itemSize' so we don't need to do it as when we access directly to the array
  m.setXYZ ( ind + 0, col.r, col.g, col.b);//
  m.setXYZ ( ind + 1, col.r, col.g, col.b);//
  m.setXYZ ( ind + 2, col.r, col.g, col.b);//     // 
}


