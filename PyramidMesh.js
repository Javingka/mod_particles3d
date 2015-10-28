function PyramidMesh( externalSizeRange, count, eSize, listX, listY, listZ ) {
  this.meshDistRange = 2000;
  this.count = count;
  this.faces = 4;
  this.totalFaceVertex = this.faces * 3; 
  this.totalData = this.totalFaceVertex * 3; // x,y,z per vertex 
  this.totalArrayData = this.count * this.totalData; 

  this.line;
  this.pyMesh;

  var positions = new Float32Array( this.totalArrayData );
  var normals = new Float32Array( this.totalArrayData );
  var colors = new Float32Array( this.totalArrayData );
	var color = new THREE.Color();
  this.geometry = new THREE.BufferGeometry();

	var n = externalSizeRange, n2 = n/2;	// elements spread in the cube
	var d = eSize, d2 = d/2;	// individual triangle size

	var pA = new THREE.Vector3();
	var pB = new THREE.Vector3();
	var pC = new THREE.Vector3();
	var pD = new THREE.Vector3();
	var pE = new THREE.Vector3();
	var pF = new THREE.Vector3();

	var cb = new THREE.Vector3();
	var ab = new THREE.Vector3();

  var rad = d - d2;
  // loop to set the position, normal and color arrays we will pass to addAttribute for geometry object
	for ( var i = 0 ; i < positions.length; i += this.totalData) {
		// index of the element. 
    var obj_i = Math.round(i/this.totalData);
    // center 
    var x = typeof listX === 'undefined'?(Math.random() * n - n2):(listX[obj_i] * n2);
    var y = typeof listY === 'undefined'?(Math.random() * n - n2):(listY[obj_i] * n2); //Math.random() * n - n2;
    var z = typeof listZ === 'undefined'?(Math.random() * n - n2):(listZ[obj_i] * n2); //Math.random() * n - n2;
    z *= -1;
    //  i; //the pyramid vertexs 
    var pVertex = [];

    // Faces should always be pair
    var ang = Math.PI*2/3;
    for ( var v = 0; v < 3; v++) {
      var angle = (ang*v);// * Math.PI / 180;
      pVertex.push(x + Math.cos(angle) * rad/2); // rad/2 make a thiner polyhedron. looks better 
      pVertex.push(y);
      pVertex.push(z + Math.sin(angle) * rad/2);
    } 
  
    angle =  0 * Math.PI / 180;
    pVertex.push(x);
    pVertex.push(y - Math.cos(angle) * rad/2);
    pVertex.push(z);

    angle =  0 * Math.PI / 180;
    pVertex.push(x);
    pVertex.push(y + Math.cos(angle) * rad/2);
    pVertex.push(z);

    /* Setting the positions of each vertex
     * position (i) selected by /the (f)ace/the vertex/the coordinate x,y and z 
     * the values from the previous stored points, are fetched in loop. except with the last two points, the upper and lower point that create the polyhedron 
     */
    var cons = 9;// number of vertex in the base plane. each one with x,y,z coordinates
    for ( var f = 0; f < this.faces; f++) { //faces is 4 in this pyramid
      // The order of the vertex determines the visible face of the triangle
      var indexY;
      if ( f < 3) {
        indexY = pVertex.length-3;
        positions[ i + (9*f) + 0 ] = pVertex[(f*3+0)%cons];
        positions[ i + (9*f) + 1 ] = pVertex[(f*3+1)%cons];
        positions[ i + (9*f) + 2 ] = pVertex[(f*3+2)%cons];

        positions[ i + (9*f) + 3 ] = pVertex[(f*3+3)%cons];
        positions[ i + (9*f) + 4 ] = pVertex[(f*3+4)%cons];
        positions[ i + (9*f) + 5 ] = pVertex[(f*3+5)%cons];

        positions[ i + (9*f) + 6 ] = pVertex[indexY];
        positions[ i + (9*f) + 7 ] = pVertex[indexY+1];
        positions[ i + (9*f) + 8 ] = pVertex[indexY+2];
      }
      else {
        indexY = pVertex.length-6; 
        positions[ i + (9*f) + 3 ] = pVertex[(f*3+0)%cons];
        positions[ i + (9*f) + 4 ] = pVertex[(f*3+1)%cons];
        positions[ i + (9*f) + 5 ] = pVertex[(f*3+2)%cons];

        positions[ i + (9*f) + 0 ] = pVertex[(f*3+3)%cons];
        positions[ i + (9*f) + 1 ] = pVertex[(f*3+4)%cons];
        positions[ i + (9*f) + 2 ] = pVertex[(f*3+5)%cons];

        positions[ i + (9*f) + 6 ] = pVertex[(f*3+6)%cons];
        positions[ i + (9*f) + 7 ] = pVertex[(f*3+7)%cons];
        positions[ i + (9*f) + 8 ] = pVertex[(f*3+8)%cons];
      }
    }  

		// flat face normals
    for ( var f = 0; f < this.faces; f++) { //  4faces
      pA.set( pVertex[(f*3)%cons] , 
        pVertex[(f*3+1)%cons],
        pVertex[(f*3+2)%cons]);// ax, ay, az );
      pB.set( pVertex[(f*3+3)%cons], 
        pVertex[(f*3+4)%cons],
        pVertex[(f*3+5)%cons]);// bx, by, bz );

      var indexY;
      if ( f < 3) {
        indexY = pVertex.length-3;
        pC.set(pVertex[indexY],pVertex[indexY+1],pVertex[indexY+2]);// cx, cy, cz );
		    cb.subVectors( pA, pC ); // Sets this vector to pC - pB.
		    ab.subVectors( pB, pC );
		    cb.cross( ab );
		    cb.normalize();
      } else {
        indexY = pVertex.length-6; 
        pC.set(pVertex[indexY],pVertex[indexY+1],pVertex[indexY+2]);// cx, cy, cz );
		    cb.subVectors( pA, pC ); // Sets this vector to pC - pB.
		    ab.subVectors( pA, pC );
		    cb.cross( ab );
		    cb.normalize();
      }
      
		  var nx = cb.x;
		  var ny = cb.y;
		  var nz = cb.z;

		  normals[i + (9*f) ]     = nx;
		  normals[i + (9*f) + 1 ] = ny;
		  normals[i + (9*f) + 2 ] = nz;

		  normals[i + (9*f) + 3 ] = nx;
		  normals[i + (9*f) + 4 ] = ny;
		  normals[i + (9*f) + 5 ] = nz;

		  normals[i + (9*f) + 6 ] = nx;
		  normals[i + (9*f) + 7 ] = ny;
		  normals[i + (9*f) + 8 ] = nz;
    }

		// colors
    var vx = expColorR(x/n2,y/n2,z/n2,i);
    var vy = expColorG(x/n2,y/n2,z/n2,i); //( y / n ) + 0.5;
    var vz = expColorB(x/n2,y/n2,z/n2,i); //( z / n ) + 0.5;
    
    //vx = x / (n+2);
    //color.setHSL(vx, 1.0, 0.5 );
    color.setRGB( vx, vy, vz );
    // fill the vertex colors r,g,b 
    for ( var c = 0; c < this.totalData / 3; c++) {
      colors[ i + (3*c) ]     = color.r;
      colors[ i + (3*c) + 1 ] = color.g;
      colors[ i + (3*c) + 2 ] = color.b;
    } 
	}

  // itemSize = 3 because there are 3 values (components) per vertex
	this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3) );
	this.geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3) );
  this.geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3) );

  this.geometry.computeBoundingBox();

  var material = new THREE.MeshBasicMaterial( {
     color: 0xaaaaaa,  vertexColors: THREE.VertexColors, transparent: false
	} );
	this.pyramidMesh = new THREE.Mesh( this.geometry, material );
};

PyramidMesh.prototype.raycasterSetup = function(){
  // create a geometry to draw a white line over the face intersected
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( 4 * 3 ), 3 ) );
	var material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1, transparent: true } );
  this.line = new THREE.Line( geometry, material );
	scene.add( this.line );

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
	this.pyMesh = new THREE.Mesh( geometry, material );
	scene.add( this.pyMesh );
};

PyramidMesh.prototype.raycasterIntersect = function( m, faceNumb ){
	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObject( m );
	if ( intersects.length > 0 ) {
		var intersect = intersects[ 0 ]; //the first face intersecting the line between the camera center and the mouse point
		var face = intersect.face;
    var obj = intersect.object;
    //get the position attribute of each geometry. an array wich x,y,z of each line's and  mesh's vertex
		var linePosition = this.line.geometry.attributes.position;
		var meshPosition = this.pyramidMesh.geometry.attributes.position;
    var meshOveredPos = this.pyMesh.geometry.attributes.position;
    
    // To get one ID by element. 
    // intersect.index consider the total vertex list, /3 gives one vertex_id per face.
    // and /faceNum reduce the list to the total ob element (each element has faceNumb number of faces) 
    // the result is going to be a float number. the integer part of that number is the element ID.
    var indexElementRollover =  Math.floor( intersect.index/3 / faceNumb );

    if (indexElementRollover != lastIndexMouse) { // new over element 
      newElementSelected = true;
      lastIndexMouse = Math.floor( intersect.index/3 / faceNumb );
      sendMessageToParent( [indexElementRollover] );
      console.log(indexElementRollover);
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
    
    this.pyMesh.geometry.applyMatrix( actualMesh.matrix );
    this.pyMesh.visible = true; 
    //update line matrix according the mesh
		this.line.geometry.applyMatrix( actualMesh.matrix );
		this.line.visible = true;
	} else {
    // To detect when the mouse leave an intersected face and has no other consecutive intersect detection.
    if (newElementSelected )  {
      newElementSelected = false;
      lastIndexMouse = -1;
      sendMessageToParent( [lastIndexMouse] );
      console.log(lastIndexMouse);
    } 
		this.line.visible = false;
    this.pyMesh.visible = false; 
	}
}


PyramidMesh.prototype.getMesh = function(){
	return this.pyramidMesh;
};
PyramidMesh.prototype.getCount = function() {
  return this.count;
};
PyramidMesh.prototype.getFacesNumber = function() {
  return this.faces;
};
