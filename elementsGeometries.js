function addTriangleShape( elementCount, elementSize, listX, listY, listZ ){
	var elements = elementCount;

	var geometry = new THREE.BufferGeometry();

	var positions = new Float32Array( elements * 3 * 3 ); //array. position of each triangle x,y,z for each vertex
	var normals = new Float32Array( elements * 3 * 3 ); //array. normals for each triangle's vertex
  var colors = new Float32Array( elements * 3 * 3 ); //array. the same for the color
	var color = new THREE.Color();

	var n = 2000, n2 = n/2;	// elements spread in the cube
	var d = elementSize, d2 = d/2;	// individual triangle size

	var pA = new THREE.Vector3();
	var pB = new THREE.Vector3();
	var pC = new THREE.Vector3();

	var cb = new THREE.Vector3();
	var ab = new THREE.Vector3();

	for ( var i = 0, c = 0 ; i < positions.length; i += 9, c++) {
    var obj_i = Math.round(i/9);
		// positions
    // center used to begin to calculate a random triangle
    var x = typeof listX === 'undefined'?(Math.random() * n - n2):(listX[obj_i] * n2);
    var y = typeof listX === 'undefined'?(Math.random() * n - n2):(listY[obj_i] * n2); //Math.random() * n - n2;
    var z = typeof listX === 'undefined'?(Math.random() * n - n2):(listZ[obj_i] * n2); //Math.random() * n - n2;

		var ax = x + Math.random() * d - d2;
		var ay = y + Math.random() * d - d2;
		var az = z + Math.random() * d - d2;

		var bx = x + Math.random() * d - d2;
		var by = y + Math.random() * d - d2;
		var bz = z + Math.random() * d - d2;

		var cx = x + Math.random() * d - d2;
		var cy = y + Math.random() * d - d2;
		var cz = z + Math.random() * d - d2;

		positions[ i ]     = ax;
		positions[ i + 1 ] = ay;
		positions[ i + 2 ] = az;

		positions[ i + 3 ] = bx;
		positions[ i + 4 ] = by;
		positions[ i + 5 ] = bz;

		positions[ i + 6 ] = cx;
		positions[ i + 7 ] = cy;
		positions[ i + 8 ] = cz;

		// flat face normals

		pA.set( ax, ay, az );
		pB.set( bx, by, bz );
		pC.set( cx, cy, cz );

		cb.subVectors( pC, pB );
		ab.subVectors( pA, pB );
		cb.cross( ab );

		cb.normalize();

		var nx = cb.x;
		var ny = cb.y;
		var nz = cb.z;

		normals[ i ]     = nx;
		normals[ i + 1 ] = ny;
		normals[ i + 2 ] = nz;

		normals[ i + 3 ] = nx;
		normals[ i + 4 ] = ny;
		normals[ i + 5 ] = nz;

		normals[ i + 6 ] = nx;
		normals[ i + 7 ] = ny;
		normals[ i + 8 ] = nz;

		// colors

		var vx = ( x / n ) + 0.5;
		var vy = ( y / n ) + 0.5;
		var vz = ( z / n ) + 0.5;
    
    vx = x / (n+2);
    color.setHSL(vx, 1.0, 0.5 );
    //color.setRGB( vx, vy, vz );

		colors[ i ]     = color.r;
		colors[ i + 1 ] = color.g;
		colors[ i + 2 ] = color.b;

		colors[ i + 3 ] = color.r;
		colors[ i + 4 ] = color.g;
		colors[ i + 5 ] = color.b;

		colors[ i + 6 ] = color.r;
		colors[ i + 7 ] = color.g;
		colors[ i + 8 ] = color.b;

	}
  // itemSize = 3 because there are 3 values (components) per vertex
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  //	geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  var material = new THREE.MeshBasicMaterial( {
			color: 0xaaaaaa,  vertexColors: THREE.VertexColors
	} );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
}

function addPolyhedronMesh( elementCount, elementSize, faceNum, listX, listY, listZ  ){
	var elements = elementCount;

/*  if(Object.prototype.toString.call( listColor ) === '[object Array]') {
    //TODO: pass the array color to the geometry
  } else {
    defaultElementColor = new THREE.Color(3,3,3);
  }*/

	var geometry = new THREE.BufferGeometry();

  var faces = faceNum;// 6; // 6 é o minimo
  var totalFaceVertex = faces * 3;
  var totalData = totalFaceVertex  * 3; //x,y,z for each vertex

	var positions = new Float32Array( elements * totalData ); //array. position of each face
  var normals = new Float32Array( elements * totalData ); //array. normals for each  face (each 3 vertex is a face)
  var colors = new Float32Array( elements * totalData ); //array. the same for the color
	var color = new THREE.Color();

	var n = 2000, n2 = n/2;	// elements spread in the cube
	var d = elementSize, d2 = d/2;	// individual triangle size

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
	for ( var i = 0 ; i < positions.length; i += totalData) {
		// positions
    var obj_i = Math.round(i/totalData);
    // center used to begin to calculate a random triangle
    var x = typeof listX === 'undefined'?(Math.random() * n - n2):(listX[obj_i] * n2);
    var y = typeof listY === 'undefined'?(Math.random() * n - n2):(listY[obj_i] * n2); //Math.random() * n - n2;
    var z = typeof listZ === 'undefined'?(Math.random() * n - n2):(listZ[obj_i] * n2); //Math.random() * n - n2;
    // the five vertex of the polyhedron 
    var polyVertex = [];

    // Faces should always be pair
    var ang = Math.PI*2/(faces/2);
    for ( var v = 0; v < (faces/2); v++) {
      var angle =  (ang*v);// * Math.PI / 180;
      polyVertex.push(x + Math.cos(angle) * rad/2); // rad/2 make a thiner polyhedron. looks better 
      polyVertex.push(y);
      polyVertex.push(z + Math.sin(angle) * rad/2);
    } 
  
    angle =  0 * Math.PI / 180;
    polyVertex.push(x);
    polyVertex.push(y + Math.cos(angle) * rad);
    polyVertex.push(z);

    angle =  0 * Math.PI / 180;
    polyVertex.push(x);
    polyVertex.push(y - Math.cos(angle) * rad);
    polyVertex.push(z);

    /* Setting the positions of each vertex
     * position (i) selected by /the (f)ace/the vertex/the coordinate x,y and z 
     * the values from the previous stored points, are fetched in loop. except with the last two points, the upper and lower point that create the polyhedron 
     */
    var cons = 3 * faces/2; // number of vertex in the base plane. each one with x,y,z coordinates
    for ( var f = 0; f < faces; f++) {
      // The order of the vertex determines the visible face of the triangle
      var indexY;
      if ( f < faces/2) {
        indexY = polyVertex.length-3;
        positions[ i + (9*f) + 0 ] = polyVertex[(f*3+0)%cons];
        positions[ i + (9*f) + 1 ] = polyVertex[(f*3+1)%cons];
        positions[ i + (9*f) + 2 ] = polyVertex[(f*3+2)%cons];

        positions[ i + (9*f) + 3 ] = polyVertex[(f*3+3)%cons];
        positions[ i + (9*f) + 4 ] = polyVertex[(f*3+4)%cons];
        positions[ i + (9*f) + 5 ] = polyVertex[(f*3+5)%cons];
      }
      else {
        indexY = polyVertex.length-6; 
        positions[ i + (9*f) + 3 ] = polyVertex[(f*3+0)%cons];
        positions[ i + (9*f) + 4 ] = polyVertex[(f*3+1)%cons];
        positions[ i + (9*f) + 5 ] = polyVertex[(f*3+2)%cons];

        positions[ i + (9*f) + 0 ] = polyVertex[(f*3+3)%cons];
        positions[ i + (9*f) + 1 ] = polyVertex[(f*3+4)%cons];
        positions[ i + (9*f) + 2 ] = polyVertex[(f*3+5)%cons];
      }

      positions[ i + (9*f) + 6 ] = polyVertex[indexY];
      positions[ i + (9*f) + 7 ] = polyVertex[indexY+1];
      positions[ i + (9*f) + 8 ] = polyVertex[indexY+2];
    }  

		// flat face normals

    for ( var f = 0; f < faces; f++) { // face*3 =6
      pA.set( polyVertex[(f*3)%cons] , 
        polyVertex[(f*3+1)%cons],
        polyVertex[(f*3+2)%cons]);// ax, ay, az );
      pB.set( polyVertex[(f*3+3)%cons], 
        polyVertex[(f*3+4)%cons],
        polyVertex[(f*3+5)%cons]);// bx, by, bz );

      var indexY;
      if ( f < faces/2) {
        indexY = polyVertex.length-3;
        pC.set(polyVertex[indexY],polyVertex[indexY+1],polyVertex[indexY+2]);// cx, cy, cz );
		    cb.subVectors( pA, pC ); // Sets this vector to pC - pB.
		    ab.subVectors( pB, pC );
		    cb.cross( ab );
		    cb.normalize();
      } else {
        indexY = polyVertex.length-6; 
        pC.set(polyVertex[indexY],polyVertex[indexY+1],polyVertex[indexY+2]);// cx, cy, cz );
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
    for ( var c = 0; c<totalData/3; c++) {
      colors[ i + (3*c) ]     = color.r;
      colors[ i + (3*c) + 1 ] = color.g;
      colors[ i + (3*c) + 2 ] = color.b;
    } 
	}

  // itemSize = 3 because there are 3 values (components) per vertex
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3) );

  geometry.computeBoundingBox();
  //geometry.computeBoundingSphere();
  var material = new THREE.MeshBasicMaterial( {
     color: 0xaaaaaa,  vertexColors: THREE.VertexColors, transparent: false
	} );
	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
  //var edges = new THREE.VertexNormalsHelper( mesh, 10, 0x00ff00, 1 );
  //scene.add( edges );
}
